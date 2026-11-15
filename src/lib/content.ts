// Inhalte aus Sanity – werden beim Build abgefragt (statische Seite).
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { toHTML } from '@portabletext/to-html';
import {
  placeholderAbout,
  placeholderHome,
  placeholderLegal,
  placeholderProjects,
  placeholderSettings,
  type About,
  type Category,
  type Home,
  type Legal,
  type Project,
  type Settings,
  type SiteImage,
} from '../data/projects';

// Projekt-ID ist öffentlich (steckt ohnehin im Studio). Mit SANITY_PROJECT_ID="" lässt sich lokal ohne Sanity arbeiten.
const envProjectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;
const projectId = envProjectId === undefined ? 'kkd7bqq0' : envProjectId || undefined;
const dataset = (import.meta.env.SANITY_DATASET as string | undefined) || 'production';

/** Ohne Projekt-ID läuft die Seite mit Platzhaltern (z. B. lokal vor dem Setup) */
export const sanityEnabled = Boolean(projectId);

const client = sanityEnabled
  ? createClient({ projectId, dataset, apiVersion: '2026-11-01', useCdn: false, perspective: 'published' })
  : null;

const builder = client ? createImageUrlBuilder(client) : null;

/* ---------------- Bilder ---------------- */

interface SanityImageField {
  asset?: { _ref: string };
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
}

const WIDTHS = [480, 800, 1200, 1600, 2000, 2560];

function toImage(field: SanityImageField | null | undefined, fallbackAlt = ''): SiteImage | undefined {
  if (!builder || !field?.asset?._ref) return undefined;
  // _ref-Format: image-<id>-<breite>x<höhe>-<format>
  const match = field.asset._ref.match(/-(\d+)x(\d+)-/);
  const crop = field.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const cropW = 1 - crop.left - crop.right || 1;
  const cropH = 1 - crop.top - crop.bottom || 1;
  // Masse nach einem eventuellen Zuschnitt in Sanity
  const width = Math.round((match ? Number(match[1]) : 1600) * cropW);
  const height = Math.round((match ? Number(match[2]) : 1000) * cropH);
  const maxW = Math.min(width, WIDTHS[WIDTHS.length - 1]);
  const widths = WIDTHS.filter((w) => w < maxW);
  widths.push(maxW);
  const url = (w: number) => builder.image(field).width(w).auto('format').quality(85).url();
  // Fokuspunkt relativ zum zugeschnittenen Bild
  const clamp = (v: number) => Math.min(100, Math.max(0, v * 100));
  const pos = field.hotspot
    ? `${clamp((field.hotspot.x - crop.left) / cropW).toFixed(1)}% ${clamp((field.hotspot.y - crop.top) / cropH).toFixed(1)}%`
    : '50% 50%';
  return {
    src: url(Math.min(maxW, 1600)),
    srcset: widths.map((w) => `${url(w)} ${w}w`).join(', '),
    alt: field.alt || fallbackAlt,
    width,
    height,
    position: pos,
  };
}

const richTextHtml = (blocks: unknown) =>
  Array.isArray(blocks) && blocks.length
    ? toHTML(blocks as never, {
        components: {
          marks: {
            link: ({ children, value }) => {
              const href = String(value?.href ?? '#');
              const external = /^https?:/.test(href);
              return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>${children}</a>`;
            },
          },
        },
      })
    : '';

/* ---------------- Abfragen ---------------- */

const projectFields = `title, "slug": slug.current, category, tags, description, cover, gallery`;

interface RawProject {
  title: string;
  slug: string;
  category: Category;
  tags?: string[];
  description?: string;
  cover?: SanityImageField;
  gallery?: SanityImageField[];
}

const toProject = (p: RawProject): Project => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  tags: p.tags ?? [],
  description: p.description ?? '',
  cover: toImage(p.cover, p.title),
  images: (p.gallery ?? []).map((img, i) => toImage(img, `${p.title} – ${i + 1}`)),
});

// Jede Abfrage nur einmal pro Build
const memo = <T>(fn: () => Promise<T>) => {
  let cache: Promise<T> | undefined;
  return () => (cache ??= fn());
};

export const getProjects = memo(async (): Promise<Project[]> => {
  if (!client) return placeholderProjects;
  const raw = await client.fetch<RawProject[]>(
    `*[_type == "project" && defined(slug.current) && defined(category)] | order(orderRank asc) { ${projectFields} }`,
  );
  return raw.map(toProject);
});

export const getProjectsByCategory = async (category: Category) =>
  (await getProjects()).filter((p) => p.category === category);

export const getSettings = memo(async (): Promise<Settings> => {
  const d = placeholderSettings;
  if (!client) return d;
  // „Footer & Kontaktdaten“, „Illustration/Design → Seite“ und „Kontakt-Block“.
  // Ältere Felder aus „settings“ dienen als Rückfall, damit früher eingetragene Inhalte erhalten bleiben.
  const r = await client.fetch(`{
    "s": *[_id == "settings"][0]{ email, instagram, footerSubtitle, ctaTitle, ctaIllustration,
      illustrationHeader, designHeader,
      "illustrationPdf": illustrationPdf.asset->url, "designPdf": designPdf.asset->url },
    "ill": *[_id == "illustrationPage"][0]{ headerImage, "pdf": pdf.asset->url },
    "des": *[_id == "designPage"][0]{ headerImage, "pdf": pdf.asset->url },
    "cta": *[_id == "cta"][0]{ title, illustration }
  }`);
  const { s, ill, des, cta } = r ?? {};
  return {
    email: s?.email || d.email,
    instagram: s?.instagram || d.instagram,
    footerSubtitle: s?.footerSubtitle || d.footerSubtitle,
    pdfs: {
      illustration: ill?.pdf || s?.illustrationPdf || undefined,
      design: des?.pdf || s?.designPdf || undefined,
    },
    headers: {
      illustration: toImage(ill?.headerImage ?? s?.illustrationHeader),
      design: toImage(des?.headerImage ?? s?.designHeader),
    },
    ctaIllustration: toImage(cta?.illustration ?? s?.ctaIllustration),
    ctaTitle: cta?.title || s?.ctaTitle || d.ctaTitle,
  };
});

export const getHome = memo(async (): Promise<Home> => {
  const d = placeholderHome;
  if (!client) return { ...d, selected: placeholderProjects.filter((_, i) => [0, 4, 6].includes(i)) };
  const h = await client.fetch(
    `*[_id == "home"][0]{ heroImage, intro, "selected": selectedWorks[]->{ ${projectFields} } }`,
  );
  const selected: Project[] = (h?.selected ?? []).filter((p: RawProject | null) => p?.slug).map(toProject);
  return {
    hero: toImage(h?.heroImage),
    intro: h?.intro || d.intro,
    // Falls noch nichts ausgewählt ist: die ersten drei Projekte
    selected: selected.length ? selected : (await getProjects()).slice(0, 3),
  };
});

export const getAbout = memo(async (): Promise<About> => {
  const d = placeholderAbout;
  if (!client) return d;
  const a = await client.fetch(`*[_id == "about"][0]{ portrait, greeting, lead, body, contactIllustration }`);
  return {
    portrait: toImage(a?.portrait, 'Portrait of Kendra Schlegel'),
    greeting: a?.greeting || d.greeting,
    lead: a?.lead || d.lead,
    bodyHtml: richTextHtml(a?.body) || d.bodyHtml,
    contactIllustration: toImage(a?.contactIllustration),
  };
});

export const getLegal = memo(async (): Promise<Legal> => {
  const d = placeholderLegal;
  if (!client) return d;
  const l = await client.fetch(`*[_id == "legal"][0]{ name, address, body }`);
  return {
    name: l?.name || d.name,
    address: l?.address || d.address,
    bodyHtml: richTextHtml(l?.body) || d.bodyHtml,
  };
});

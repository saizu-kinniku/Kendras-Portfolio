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

const projectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;
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
  crop?: unknown;
  alt?: string;
}

const WIDTHS = [480, 800, 1200, 1600, 2000, 2560];

function toImage(field: SanityImageField | null | undefined, fallbackAlt = ''): SiteImage | undefined {
  if (!builder || !field?.asset?._ref) return undefined;
  // _ref-Format: image-<id>-<breite>x<höhe>-<format>
  const match = field.asset._ref.match(/-(\d+)x(\d+)-/);
  const width = match ? Number(match[1]) : 1600;
  const height = match ? Number(match[2]) : 1000;
  const widths = WIDTHS.filter((w) => w <= width);
  if (!widths.length || widths[widths.length - 1] < width) widths.push(Math.min(width, 2560));
  const url = (w: number) => builder.image(field).width(w).auto('format').quality(85).url();
  const pos = field.hotspot ? `${(field.hotspot.x * 100).toFixed(1)}% ${(field.hotspot.y * 100).toFixed(1)}%` : '50% 50%';
  return {
    src: url(Math.min(width, 1600)),
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
  const s = await client.fetch(
    `*[_id == "settings"][0]{ email, instagram, ctaTitle, ctaIllustration, illustrationHeader, designHeader,
      "illustrationPdf": illustrationPdf.asset->url, "designPdf": designPdf.asset->url }`,
  );
  return {
    email: s?.email || d.email,
    instagram: s?.instagram || d.instagram,
    pdfs: {
      illustration: s?.illustrationPdf || d.pdfs.illustration,
      design: s?.designPdf || d.pdfs.design,
    },
    headers: {
      illustration: toImage(s?.illustrationHeader),
      design: toImage(s?.designHeader),
    },
    ctaIllustration: toImage(s?.ctaIllustration),
    ctaTitle: s?.ctaTitle || d.ctaTitle,
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

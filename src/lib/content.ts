// Lädt die Inhalte aus src/content/ (bearbeitet mit Pages CMS) und optimiert die Bilder.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import type { About, Category, Home, Legal, Project, Settings, SiteImage } from '../data/projects';

/* ---------------- Rohdaten ---------------- */

const pageFiles = import.meta.glob<Record<string, any>>('/src/content/pages/*.json', {
  eager: true,
  import: 'default',
});
const page = (name: string): Record<string, any> => pageFiles[`/src/content/pages/${name}.json`] ?? {};

const projectFiles = import.meta.glob<{ frontmatter: Record<string, any> }>(
  '/src/content/{illustration,design}/*.md',
  { eager: true },
);

// Hochgeladene Bilder (Pages CMS speichert sie in src/assets/uploads, im Inhalt steht "/uploads/…")
const uploads = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/uploads/**/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}',
  { eager: true },
);

/* ---------------- Hilfsfunktionen ---------------- */

const text = (v: unknown, fallback = '') => (typeof v === 'string' && v.trim() ? v.trim() : fallback);

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Absätze (durch Leerzeile getrennt) → <p>, einzelne Zeilenumbrüche → <br> */
const paragraphs = (s: string) =>
  s
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
    .join('');

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Bildausschnitt (9er-Raster im CMS) → object-position */
const focusPositions: Record<string, string> = {
  'top-left': '0% 0%',
  top: '50% 0%',
  'top-right': '100% 0%',
  left: '0% 50%',
  center: '50% 50%',
  right: '100% 50%',
  'bottom-left': '0% 100%',
  bottom: '50% 100%',
  'bottom-right': '100% 100%',
};

/** Öffentliche URL einer hochgeladenen Datei (PDF), Leerzeichen etc. kodiert */
const fileUrl = (v: unknown) => {
  const s = text(v);
  return s ? encodeURI(decodeURI(s)) : undefined;
};

/* ---------------- Bilder ---------------- */

const WIDTHS = [480, 800, 1200, 1600, 2000, 2560];
const imageCache = new Map<string, Promise<SiteImage | undefined>>();

/** "/uploads/foo.jpg" → optimiertes Bild mit srcset (WebP) */
function toImage(path: unknown, alt = '', focus: unknown = 'center'): Promise<SiteImage | undefined> {
  const raw = text(path);
  if (!raw) return Promise.resolve(undefined);
  const key = `${raw}|${alt}|${focus}`;
  if (!imageCache.has(key)) imageCache.set(key, buildImage(raw, alt, String(focus)));
  return imageCache.get(key)!;
}

async function buildImage(raw: string, alt: string, focus: string): Promise<SiteImage | undefined> {
  const rel = decodeURI(raw).replace(/^.*?uploads\//, '');
  const meta = uploads[`/src/assets/uploads/${rel}`]?.default;
  if (!meta) {
    console.warn(`[content] Bild nicht gefunden: ${raw}`);
    return undefined;
  }
  const maxW = Math.min(meta.width, WIDTHS[WIDTHS.length - 1]);
  const widths = [...WIDTHS.filter((w) => w < maxW), maxW];
  const variants = await Promise.all(
    widths.map((w) => getImage({ src: meta, width: w, format: 'webp', quality: 82 })),
  );
  const defaultIndex = Math.max(0, widths.findIndex((w) => w >= Math.min(1600, maxW)));
  return {
    src: variants[defaultIndex].src,
    srcset: variants.map((v, i) => `${v.src} ${widths[i]}w`).join(', '),
    alt,
    width: meta.width,
    height: meta.height,
    position: focusPositions[focus] ?? focusPositions.center,
  };
}

/* ---------------- Projekte ---------------- */

const memo = <T>(fn: () => Promise<T>) => {
  let cache: Promise<T> | undefined;
  return () => (cache ??= fn());
};

export const getProjects = memo(async (): Promise<Project[]> => {
  const list = await Promise.all(
    Object.entries(projectFiles).map(async ([file, mod]) => {
      const fm = mod.frontmatter ?? {};
      const category = (file.includes('/design/') ? 'design' : 'illustration') as Category;
      const filename = file.split('/').pop()!.replace(/\.md$/, '');
      const title = text(fm.title, filename);
      return {
        slug: slugify(filename) || slugify(title),
        title,
        category,
        tags: Array.isArray(fm.tags) ? fm.tags.map(String).filter(Boolean) : [],
        description: text(fm.description),
        featured: fm.featured === true,
        order: Number.isFinite(Number(fm.order)) && fm.order !== '' && fm.order !== null ? Number(fm.order) : 999,
        cover: await toImage(fm.cover, '', fm.coverFocus),
        images: (
          await Promise.all(
            (Array.isArray(fm.gallery) ? fm.gallery : []).map((g: unknown, i: number) =>
              toImage(g, `${title} – ${i + 1}`),
            ),
          )
        ).filter(Boolean) as SiteImage[],
      } satisfies Project;
    }),
  );
  return list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'de'));
});

export const getProjectsByCategory = async (category: Category) =>
  (await getProjects()).filter((p) => p.category === category);

/* ---------------- Seiten ---------------- */

export const getSettings = memo(async (): Promise<Settings> => {
  const s = page('settings');
  const ill = page('illustration');
  const des = page('design');
  const cta = page('cta');
  return {
    email: text(s.email, 'kendraschlegelart@gmail.com'),
    instagram: text(s.instagram).replace(/^@/, ''),
    footerSubtitle: text(s.footerSubtitle, 'Illustration and Graphic Design'),
    pdfs: { illustration: fileUrl(ill.pdf), design: fileUrl(des.pdf) },
    headers: {
      illustration: await toImage(ill.headerImage, '', ill.headerFocus),
      design: await toImage(des.headerImage, '', des.headerFocus),
    },
    ctaIllustration: await toImage(cta.illustration),
    ctaTitle: text(cta.title, 'You have questions, want to work with me or just have a chat?'),
  };
});

export const getHome = memo(async (): Promise<Home> => {
  const h = page('home');
  const projects = await getProjects();
  const featured = projects.filter((p) => p.featured);
  return {
    hero: await toImage(h.heroImage, '', h.heroFocus),
    intro: text(h.intro),
    // Projekte mit „Auf der Startseite zeigen“; sonst die ersten drei
    selected: featured.length ? featured : projects.slice(0, 3),
  };
});

export const getAbout = memo(async (): Promise<About> => {
  const a = page('about');
  return {
    portrait: await toImage(a.portrait, 'Portrait of Kendra Schlegel', a.portraitFocus),
    greeting: text(a.greeting, 'Hello!'),
    lead: text(a.lead),
    bodyHtml: paragraphs(text(a.body)),
    contactIllustration: await toImage(a.contactIllustration),
  };
});

export const getLegal = memo(async (): Promise<Legal> => {
  const l = page('legal');
  const sections: { title?: string; text?: string }[] = Array.isArray(l.sections) ? l.sections : [];
  return {
    name: text(l.name, 'Kendra Schlegel'),
    address: text(l.address),
    bodyHtml: sections
      .map((s) => `${text(s.title) ? `<h2>${escapeHtml(text(s.title))}</h2>` : ''}${paragraphs(text(s.text))}`)
      .join(''),
  };
});

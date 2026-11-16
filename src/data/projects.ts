// Typen und Hilfsfunktionen. Die Inhalte selbst liegen in src/content/ und werden mit
// Pages CMS bearbeitet (siehe .pages.yml); geladen werden sie in src/lib/content.ts.

export type Category = 'illustration' | 'design';

export interface SiteImage {
  src: string;
  srcset: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position (Bildausschnitt) */
  position: string;
}

/** Hochgeladenes Video (läuft stumm in Schleife) */
export interface SiteVideo {
  src: string;
  type: string;
}

/** Breite eines Bildes/Videos auf der Projektseite: gross = volle Breite, mittel = ¾, klein = ½ */
export type MediaWidth = 'large' | 'medium' | 'small';

/** Eintrag in der Galerie einer Projektseite: Bild, Video (Bild dient dann als Vorschaubild) oder beides */
export interface GalleryItem {
  image?: SiteImage;
  video?: SiteVideo;
  width: MediaWidth;
}

export interface Project {
  slug: string;
  title: string;
  category: Category;
  /** Schlagworte unter dem Titel, z. B. "Editorial, Character Design" */
  tags: string[];
  description: string;
  featured: boolean;
  order: number;
  cover?: SiteImage;
  /** Optional: Video statt Titelbild auf der Projektkarte */
  coverVideo?: SiteVideo;
  gallery: GalleryItem[];
}

export interface Settings {
  email: string;
  instagram: string;
  footerSubtitle: string;
  /** PDF-URLs; fehlt eins, werden die Buttons ausgeblendet */
  pdfs: Partial<Record<Category, string>>;
  headers: Partial<Record<Category, SiteImage>>;
  ctaIllustration?: SiteImage;
  ctaTitle: string;
}

export interface Home {
  hero?: SiteImage;
  heroVideo?: SiteVideo;
  intro: string;
  selected: Project[];
}

export interface About {
  portrait?: SiteImage;
  greeting: string;
  lead: string;
  /** HTML (Absätze) */
  bodyHtml: string;
  contactIllustration?: SiteImage;
}

export interface Legal {
  name: string;
  address: string;
  /** HTML (Zwischentitel + Absätze) */
  bodyHtml: string;
}

export const categories: Category[] = ['illustration', 'design'];

export const categoryLabels: Record<Category, { title: string; nav: string }> = {
  illustration: { title: 'Illustration', nav: 'Illustration' },
  design: { title: 'Design', nav: 'Design Work' },
};

export const projectUrl = (p: Pick<Project, 'slug' | 'category'>) => `/${p.category}/${p.slug}/`;
export const categoryUrl = (c: Category) => `/${c}/`;

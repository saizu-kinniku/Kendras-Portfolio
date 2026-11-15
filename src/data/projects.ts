// Typen, Hilfsfunktionen und Platzhalter-Inhalte.
// Die echten Inhalte kommen aus Sanity (src/lib/content.ts). Solange keine Projekt-ID
// gesetzt ist oder ein Feld leer ist, werden diese Platzhalter verwendet.

export type Category = 'illustration' | 'design';

export interface SiteImage {
  src: string;
  srcset: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position aus dem Sanity-Fokuspunkt */
  position: string;
}

export interface Project {
  slug: string;
  title: string;
  category: Category;
  /** Schlagworte unter dem Titel, z. B. "Editorial, Character Design" */
  tags: string[];
  description: string;
  cover?: SiteImage;
  images: (SiteImage | undefined)[];
}

export interface Settings {
  email: string;
  instagram: string;
  pdfs: Record<Category, string>;
  headers: Partial<Record<Category, SiteImage>>;
  ctaIllustration?: SiteImage;
  ctaTitle: string;
}

export interface Home {
  hero?: SiteImage;
  intro: string;
  selected: Project[];
}

export interface About {
  portrait?: SiteImage;
  greeting: string;
  lead: string;
  /** HTML aus Portable Text */
  bodyHtml: string;
  contactIllustration?: SiteImage;
}

export interface Legal {
  name: string;
  address: string;
  bodyHtml: string;
}

export const categoryLabels: Record<Category, { title: string; nav: string }> = {
  illustration: { title: 'Illustration', nav: 'Illustration' },
  design: { title: 'Design', nav: 'Design Work' },
};

export const projectUrl = (p: Pick<Project, 'slug'>) => `/projects/${p.slug}/`;
export const categoryUrl = (c: Category) => `/${c}/`;

/* ---------------- Platzhalter ---------------- */

const placeholderImages = [undefined, undefined, undefined, undefined];

const placeholder = (slug: string, title: string, category: Category): Project => ({
  slug,
  title,
  category,
  tags: ['Category', 'Category'],
  description: 'Projekt Beschreibung',
  images: placeholderImages,
});

export const placeholderProjects: Project[] = [
  placeholder('projekt-illustration-1', 'Projekttitel', 'illustration'),
  placeholder('projekt-illustration-2', 'das ist ein langer titel zum testen', 'illustration'),
  placeholder('projekt-illustration-3', 'Projekttitel', 'illustration'),
  placeholder('projekt-illustration-4', 'das ist ein langer titel zum testen', 'illustration'),
  placeholder('projekt-design-1', 'Projekttitel', 'design'),
  placeholder('projekt-design-2', 'das ist ein langer titel zum testen', 'design'),
  placeholder('projekt-design-3', 'Projekttitel', 'design'),
  placeholder('projekt-design-4', 'das ist ein langer titel zum testen', 'design'),
  placeholder('projekt-design-5', 'Projekttitel', 'design'),
  placeholder('projekt-design-6', 'das ist ein langer titel zum testen', 'design'),
];

export const placeholderSettings: Settings = {
  email: 'kendraschlegelart@gmail.com',
  instagram: 'kendraschlegel',
  pdfs: { illustration: '#', design: '#' },
  headers: {},
  ctaTitle: 'You have questions, want to work with me or just have a chat?',
};

export const placeholderHome: Omit<Home, 'selected'> = {
  intro:
    'Hi, I’m Kendra – a graphic designer and illustrator based in Switzerland. Take a look around and explore my illustration and design work, or download the PDF versions of my portfolio below. Enjoy!',
};

export const placeholderAbout: About = {
  greeting: 'Hello!',
  lead: 'My name is Kendra Schlegel, and I’m an illustrator and graphic designer based in Switzerland. I love creating characters, telling stories, and bringing ideas to life.',
  bodyHtml: [
    'I hold a Master’s degree in Design and Information from the Technical University of Applied Sciences Würzburg-Schweinfurt, following a Bachelor’s degree in Communication Design from HTWG University of Applied Sciences in Konstanz. Alongside my studies, I was already working as a freelance illustrator and designer, gaining valuable experience and developing my own creative practice.',
    'Today, I work from my home studio, where I explore a variety of ideas and creative directions. My work is inspired by my travels, everyday discoveries, and my many interests. I guess you could call me a bit of a hobby collector – always curious, always exploring, and always finding inspiration in unexpected places.',
    'I’m always happy to connect and open to collaborations and new creative projects. If you have an idea in mind or simply want to say hello, feel free to get in touch!',
  ]
    .map((p) => `<p>${p}</p>`)
    .join(''),
};

export const placeholderLegal: Legal = {
  name: 'Kendra Schlegel',
  address: 'Strasse Nr.\nPLZ Ort\nSwitzerland',
  bodyHtml: [
    '<h2>Copyright</h2>',
    '<p>All illustrations, designs and images on this website are the property of Kendra Schlegel unless stated otherwise. Any use requires prior written permission.</p>',
    '<h2>Disclaimer</h2>',
    '<p>The content of this website has been created with care. However, no guarantee is given for the accuracy, completeness or timeliness of the information. Links to external websites are outside our responsibility.</p>',
  ].join(''),
};

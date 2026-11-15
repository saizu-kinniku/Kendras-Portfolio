import {defineArrayMember, defineField, defineType} from 'sanity'

const imageWithAlt = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    description,
    type: 'image',
    options: {hotspot: true},
    fields: [defineField({name: 'alt', title: 'Bildbeschreibung', type: 'string'})],
  })

/** Einfacher Fliesstext mit Zwischentiteln, fett/kursiv und Links */
const richText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [
          {title: 'Absatz', value: 'normal'},
          {title: 'Zwischentitel', value: 'h2'},
        ],
        lists: [],
        marks: {
          decorators: [
            {title: 'Fett', value: 'strong'},
            {title: 'Kursiv', value: 'em'},
          ],
          annotations: [
            {
              name: 'link',
              type: 'object',
              title: 'Link',
              fields: [{name: 'href', type: 'url', title: 'URL', validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto', 'tel']})}],
            },
          ],
        },
      }),
    ],
  })

export const home = defineType({
  name: 'home',
  title: 'Startseite',
  type: 'document',
  fields: [
    imageWithAlt('heroImage', 'Hero-Bild', 'Desktop im Querformat (16:9), auf dem Handy hochformatig (4:5) – Fokuspunkt setzen.'),
    defineField({
      name: 'intro',
      title: 'Introtext',
      type: 'text',
      rows: 3,
      initialValue:
        'Hi, I’m Kendra – a graphic designer and illustrator based in Switzerland. Take a look around and explore my illustration and design work, or download the PDF versions of my portfolio below. Enjoy!',
    }),
    defineField({
      name: 'selectedWorks',
      title: 'Selected works',
      description: 'Projekte, die auf der Startseite erscheinen (Reihenfolge per Drag & Drop).',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
      validation: (rule) => rule.max(6).unique(),
    }),
  ],
  preview: {prepare: () => ({title: 'Startseite'})},
})

export const about = defineType({
  name: 'about',
  title: 'About & Contact',
  type: 'document',
  fields: [
    imageWithAlt('portrait', 'Porträt', 'Hochformat (ca. 2:3).'),
    defineField({name: 'greeting', title: 'Begrüssung', type: 'string', initialValue: 'Hello!'}),
    defineField({
      name: 'lead',
      title: 'Einleitung (gross)',
      type: 'text',
      rows: 3,
    }),
    richText('body', 'Text'),
    imageWithAlt('contactIllustration', 'Illustration beim Kontaktformular', 'Quadratisch.'),
  ],
  preview: {prepare: () => ({title: 'About & Contact'})},
})

export const legal = defineType({
  name: 'legal',
  title: 'Impressum',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string'}),
    defineField({name: 'address', title: 'Adresse', type: 'text', rows: 3}),
    richText('body', 'Weitere Angaben'),
  ],
  preview: {prepare: () => ({title: 'Impressum'})},
})

export const settings = defineType({
  name: 'settings',
  title: 'Allgemein',
  type: 'document',
  groups: [
    {name: 'contact', title: 'Kontakt', default: true},
    {name: 'portfolio', title: 'Portfolio-Seiten'},
    {name: 'cta', title: 'Kontakt-Block'},
  ],
  fields: [
    defineField({name: 'email', title: 'E-Mail', type: 'string', group: 'contact', validation: (rule) => rule.email()}),
    defineField({name: 'instagram', title: 'Instagram-Name (ohne @)', type: 'string', group: 'contact'}),
    defineField({name: 'illustrationPdf', title: 'PDF Illustration-Portfolio', type: 'file', options: {accept: 'application/pdf'}, group: 'portfolio'}),
    defineField({name: 'designPdf', title: 'PDF Design-Portfolio', type: 'file', options: {accept: 'application/pdf'}, group: 'portfolio'}),
    {...imageWithAlt('illustrationHeader', 'Header-Bild Illustration', 'Breites Format (ca. 4:1).'), group: 'portfolio'},
    {...imageWithAlt('designHeader', 'Header-Bild Design', 'Breites Format (ca. 4:1).'), group: 'portfolio'},
    {...imageWithAlt('ctaIllustration', 'Illustration im Kontakt-Block', 'Quadratisch. Erscheint unten auf Start-, Übersichts- und Projektseiten.'), group: 'cta'},
    defineField({
      name: 'ctaTitle',
      title: 'Titel',
      type: 'string',
      group: 'cta',
      initialValue: 'You have questions, want to work with me or just have a chat?',
    }),
  ],
  preview: {prepare: () => ({title: 'Allgemein'})},
})

import {defineArrayMember, defineField, defineType} from 'sanity'

/* Die Felder stehen jeweils in der Reihenfolge, in der sie auf der Website erscheinen (von oben nach unten). */

const imageField = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: 'image',
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        title: 'Bildbeschreibung',
        description: 'Kurz beschreiben, was zu sehen ist – für Screenreader und Suchmaschinen.',
        type: 'string',
      }),
    ],
  })

/** Fliesstext mit Zwischentiteln, fett/kursiv und Links */
const richText = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    description,
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
              fields: [
                {
                  name: 'href',
                  type: 'url',
                  title: 'URL',
                  validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
                },
              ],
            },
          ],
        },
      }),
    ],
  })

/* ---------------- Startseite ---------------- */

export const home = defineType({
  name: 'home',
  title: 'Startseite',
  type: 'document',
  fields: [
    imageField(
      'heroImage',
      'Hero-Bild',
      'Grosses Bild ganz oben, füllt den ganzen Bildschirm. Auf dem Handy wird es hochformatig zugeschnitten – mit dem Fokuspunkt (Kreis-Symbol) bestimmst du, was sichtbar bleibt.',
    ),
    defineField({
      name: 'intro',
      title: 'Introtext',
      description:
        'Steht unten links im Hero. Die zwei PDF-Buttons darunter verlinken die PDFs aus „Illustration → Seite“ und „Design → Seite“.',
      type: 'text',
      rows: 3,
      initialValue:
        'Hi, I’m Kendra – a graphic designer and illustrator based in Switzerland. Take a look around and explore my illustration and design work, or download the PDF versions of my portfolio below. Enjoy!',
    }),
    defineField({
      name: 'selectedWorks',
      title: 'Selected works',
      description:
        'Projekte, die auf der Startseite gross gezeigt werden. Reihenfolge per Drag & Drop. Leer = die ersten drei Projekte.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
      validation: (rule) => rule.max(6).unique(),
    }),
  ],
  preview: {prepare: () => ({title: 'Startseite'})},
})

/* ---------------- Übersichtsseiten Illustration / Design ---------------- */

export const categoryPage = defineType({
  name: 'categoryPage',
  title: 'Übersichtsseite',
  type: 'document',
  fields: [
    imageField(
      'headerImage',
      'Header-Bild',
      'Breites Bild ganz oben auf der Seite (ca. 4:1). Fokuspunkt setzen, damit auf dem Handy das Wichtige sichtbar bleibt.',
    ),
    defineField({
      name: 'pdf',
      title: 'PDF-Portfolio',
      description:
        'Wird unten auf dieser Seite („Download PDF Version“) und im Hero der Startseite verlinkt. Ohne PDF werden die Buttons ausgeblendet.',
      type: 'file',
      options: {accept: 'application/pdf'},
    }),
  ],
  preview: {
    select: {id: '_id'},
    prepare: ({id}) => ({title: String(id).includes('design') ? 'Design – Seite' : 'Illustration – Seite'}),
  },
})

/* ---------------- About & Contact ---------------- */

export const about = defineType({
  name: 'about',
  title: 'About & Contact',
  type: 'document',
  fields: [
    imageField('portrait', 'Porträt', 'Rechts neben dem Text, auf dem Handy oben. Hochformat (ca. 2:3).'),
    defineField({
      name: 'greeting',
      title: 'Begrüssung',
      description: 'Grosse orange Zeile, z. B. „Hello!“.',
      type: 'string',
      initialValue: 'Hello!',
    }),
    defineField({
      name: 'lead',
      title: 'Einleitung',
      description: 'Grosser Text direkt unter der Begrüssung.',
      type: 'text',
      rows: 3,
    }),
    richText('body', 'Text', 'Normaler Fliesstext darunter. Absätze mit Enter trennen.'),
    imageField(
      'contactIllustration',
      'Illustration beim Kontaktformular',
      'Links neben „Get in touch“. Quadratisch.',
    ),
  ],
  preview: {prepare: () => ({title: 'About & Contact'})},
})

/* ---------------- Impressum ---------------- */

export const legal = defineType({
  name: 'legal',
  title: 'Impressum',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string'}),
    defineField({
      name: 'address',
      title: 'Adresse',
      description: 'Jede Zeile einzeln (Strasse, PLZ Ort, Land).',
      type: 'text',
      rows: 3,
    }),
    richText(
      'body',
      'Weitere Abschnitte',
      'Z. B. Copyright, Haftungsausschluss. Abschnittstitel als „Zwischentitel“ formatieren.',
    ),
  ],
  preview: {prepare: () => ({title: 'Impressum'})},
})

/* ---------------- Auf allen Seiten ---------------- */

export const ctaBlock = defineType({
  name: 'ctaBlock',
  title: 'Kontakt-Block',
  type: 'document',
  description: 'Gelber Block unten auf Startseite, Übersichten und Projektseiten.',
  fields: [
    imageField('illustration', 'Illustration', 'Links im gelben Block. Quadratisch.'),
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      initialValue: 'You have questions, want to work with me or just have a chat?',
    }),
  ],
  preview: {prepare: () => ({title: 'Kontakt-Block'})},
})

export const settings = defineType({
  name: 'settings',
  title: 'Footer & Kontaktdaten',
  type: 'document',
  fields: [
    defineField({
      name: 'footerSubtitle',
      title: 'Untertitel im Footer',
      description: 'Steht unter „Kendra Schlegel“.',
      type: 'string',
      initialValue: 'Illustration and Graphic Design',
    }),
    defineField({
      name: 'email',
      title: 'E-Mail',
      description: 'Im Footer und im Impressum.',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram-Name (ohne @)',
      description: 'Wird im Kontakt-Block verlinkt.',
      type: 'string',
    }),

    // Ältere Felder – inzwischen unter „Illustration/Design → Seite“ und „Kontakt-Block“.
    // Ausgeblendet, damit bereits eingetragene Inhalte erhalten bleiben.
    defineField({name: 'illustrationPdf', type: 'file', hidden: true}),
    defineField({name: 'designPdf', type: 'file', hidden: true}),
    defineField({name: 'illustrationHeader', type: 'image', hidden: true}),
    defineField({name: 'designHeader', type: 'image', hidden: true}),
    defineField({name: 'ctaIllustration', type: 'image', hidden: true}),
    defineField({name: 'ctaTitle', type: 'string', hidden: true}),
  ],
  preview: {prepare: () => ({title: 'Footer & Kontaktdaten'})},
})

/* ---------------- Website aktualisieren ---------------- */

export const deployTrigger = defineType({
  name: 'deployTrigger',
  title: 'Website aktualisieren',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({
      name: 'requestedAt',
      title: 'Zuletzt aktualisiert',
      description:
        'Unten rechts auf „Alles veröffentlichen & Website aktualisieren“ klicken: Alle offenen Änderungen werden veröffentlicht und die Website einmal neu gebaut (ca. 2 Minuten). Einzelnes „Publish“ in den anderen Dokumenten speichert nur – online geht es erst mit diesem Button.',
      type: 'datetime',
    }),
    defineField({
      name: 'publishedCount',
      title: 'Dabei veröffentlichte Änderungen',
      type: 'number',
    }),
  ],
  preview: {prepare: () => ({title: 'Website aktualisieren'})},
})

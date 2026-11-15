import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

/* Felder in der Reihenfolge: zuerst was auf der Projektkarte steht, dann die Projektseite. */

export const project = defineType({
  name: 'project',
  title: 'Projekt',
  type: 'document',
  orderings: [orderRankOrdering],
  groups: [
    {name: 'card', title: 'Projektkarte', default: true},
    {name: 'page', title: 'Projektseite'},
  ],
  fields: [
    orderRankField({type: 'project'}),
    defineField({
      name: 'category',
      title: 'Bereich',
      description: 'Bestimmt, auf welcher Übersichtsseite das Projekt erscheint.',
      type: 'string',
      group: ['card', 'page'],
      options: {
        list: [
          {title: 'Illustration', value: 'illustration'},
          {title: 'Design', value: 'design'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Titel',
      description: 'Auf der Projektkarte und als Überschrift der Projektseite.',
      type: 'string',
      group: ['card', 'page'],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cover',
      title: 'Titelbild',
      description:
        'Bild auf der Projektkarte (Übersicht und Startseite). Mit dem Fokuspunkt bestimmst du, welcher Teil beim Zuschneiden sichtbar bleibt.',
      type: 'image',
      group: 'card',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Bildbeschreibung', type: 'string'})],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Schlagworte',
      description: 'Klein unter dem Titel auf der Projektkarte, z. B. „Editorial“, „Character Design“. Mit Enter bestätigen.',
      type: 'array',
      group: 'card',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      description: 'Kurzer Text unter dem Titel auf der Projektseite.',
      type: 'text',
      rows: 4,
      group: 'page',
    }),
    defineField({
      name: 'gallery',
      title: 'Bilder',
      description:
        'Bilder auf der Projektseite, untereinander in voller Breite und im Originalformat (nicht beschnitten). Reihenfolge per Drag & Drop.',
      type: 'array',
      group: 'page',
      of: [
        defineArrayMember({
          type: 'image',
          fields: [defineField({name: 'alt', title: 'Bildbeschreibung', type: 'string'})],
        }),
      ],
      options: {layout: 'grid'},
    }),
    defineField({
      name: 'slug',
      title: 'Adresse der Projektseite',
      description: 'Wird aus dem Titel erzeugt – einfach auf „Generate“ klicken. Später möglichst nicht mehr ändern.',
      type: 'slug',
      group: 'page',
      options: {source: 'title', maxLength: 80},
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', category: 'category', media: 'cover'},
    prepare: ({title, category, media}) => ({
      title: title || 'Neues Projekt',
      subtitle: category === 'design' ? 'Design' : category === 'illustration' ? 'Illustration' : 'Bereich fehlt',
      media,
    }),
  },
})

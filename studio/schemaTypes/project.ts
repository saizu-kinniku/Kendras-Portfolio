import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const project = defineType({
  name: 'project',
  title: 'Projekt',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'project'}),
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      description: 'Wird aus dem Titel erzeugt – einfach auf „Generate“ klicken.',
      type: 'slug',
      options: {source: 'title', maxLength: 80},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Bereich',
      type: 'string',
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
      name: 'tags',
      title: 'Schlagworte',
      description: 'Erscheinen unter dem Titel auf den Projektkarten, z. B. „Editorial“, „Character Design“.',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'cover',
      title: 'Titelbild',
      description: 'Bild auf der Projektkarte. Mit dem Fokuspunkt bestimmst du, welcher Teil beim Zuschneiden sichtbar bleibt.',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Bildbeschreibung (für Screenreader)', type: 'string'})],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Bilder',
      description: 'Bilder auf der Projektseite, in dieser Reihenfolge. Per Drag & Drop sortieren.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Bildbeschreibung', type: 'string'})],
        }),
      ],
      options: {layout: 'grid'},
    }),
  ],
  preview: {
    select: {title: 'title', category: 'category', media: 'cover'},
    prepare: ({title, category, media}) => ({
      title,
      subtitle: category === 'design' ? 'Design' : 'Illustration',
      media,
    }),
  },
})

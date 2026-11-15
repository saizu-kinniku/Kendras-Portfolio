import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes, singletons} from './schemaTypes'

// Projekt-ID aus sanity.io/manage – wird beim Build über die Umgebungsvariable gesetzt
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'kkd7bqq0'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

const singletonTypes = new Set<string>(singletons.map((s) => s.type))

export default defineConfig({
  name: 'default',
  title: 'Kendra Schlegel',
  // basePath kommt aus sanity.cli.ts (project.basePath)
  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Inhalte')
          .items([
            orderableDocumentListDeskItem({
              type: 'project',
              title: 'Illustration',
              id: 'projects-illustration',
              filter: 'category == $category',
              params: {category: 'illustration'},
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: 'project',
              title: 'Design',
              id: 'projects-design',
              filter: 'category == $category',
              params: {category: 'design'},
              S,
              context,
            }),
            S.divider(),
            ...singletons.map((s) =>
              S.listItem()
                .title(s.title)
                .id(s.id)
                .child(S.document().schemaType(s.type).documentId(s.id).title(s.title)),
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Einzelseiten nicht über „Neues Dokument“ anlegbar
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Einzelseiten: kein Duplizieren/Löschen
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
})

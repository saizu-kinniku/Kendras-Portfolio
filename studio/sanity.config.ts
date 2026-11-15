import {defineConfig} from 'sanity'
import {structureTool, type StructureBuilder, type StructureResolverContext} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
// Icons einzeln importieren (@sanity/icons v5)
import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {CaseIcon} from '@sanity/icons/Case'
import {DocumentIcon} from '@sanity/icons/Document'
import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {HomeIcon} from '@sanity/icons/Home'
import {ImagesIcon} from '@sanity/icons/Images'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'
import {PresentationIcon} from '@sanity/icons/Presentation'
import {UserIcon} from '@sanity/icons/User'
import {schemaTypes, singletonTypes} from './schemaTypes'

// Projekt-ID aus sanity.io/manage – per Umgebungsvariable überschreibbar
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'kkd7bqq0'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

/** Einzelseite mit fester ID */
const singleton = (S: StructureBuilder, id: string, type: string, title: string, icon?: any) =>
  S.listItem()
    .title(title)
    .id(id)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(id).title(title))

/** Bereich Illustration / Design: Seite + sortierbare Projektliste */
const categorySection = (
  S: StructureBuilder,
  context: StructureResolverContext,
  category: 'illustration' | 'design',
  title: string,
  icon: any,
) =>
  S.listItem()
    .title(title)
    .id(category)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items([
          singleton(S, `${category}Page`, 'categoryPage', 'Seite (Header-Bild & PDF)', DocumentIcon),
          orderableDocumentListDeskItem({
            type: 'project',
            id: `projects-${category}`,
            title: 'Projekte',
            icon: CaseIcon,
            filter: 'category == $category',
            params: {category},
            createIntent: false,
            menuItems: [
              S.menuItem()
                .title('Neues Projekt')
                .intent({type: 'create', params: {type: 'project', template: `project-${category}`}})
                .serialize(),
            ],
            S,
            context,
          }),
        ]),
    )

export default defineConfig({
  name: 'default',
  title: 'Kendra Schlegel',
  // basePath kommt aus sanity.cli.ts (project.basePath)
  projectId,
  dataset,

  plugins: [
    structureTool({
      title: 'Inhalte',
      // Aufbau wie die Website: Seiten in der Reihenfolge der Navigation, darunter was auf allen Seiten erscheint
      structure: (S, context) =>
        S.list()
          .title('Website')
          .items([
            singleton(S, 'home', 'home', 'Startseite', HomeIcon),
            categorySection(S, context, 'illustration', 'Illustration', ImagesIcon),
            categorySection(S, context, 'design', 'Design', PresentationIcon),
            singleton(S, 'about', 'about', 'About & Contact', UserIcon),
            singleton(S, 'legal', 'legal', 'Impressum (Legal Notice)', InfoOutlineIcon),
            S.divider(),
            S.listItem()
              .title('Auf allen Seiten')
              .id('global')
              .icon(EarthGlobeIcon)
              .child(
                S.list()
                  .title('Auf allen Seiten')
                  .items([
                    singleton(S, 'cta', 'ctaBlock', 'Kontakt-Block (gelb, unten)', BlockquoteIcon),
                    singleton(S, 'settings', 'settings', 'Footer & Kontaktdaten', InfoOutlineIcon),
                  ]),
              ),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => [
      // Einzelseiten nicht über „Neues Dokument“ anlegbar
      ...templates.filter(({schemaType}) => !singletonTypes.has(schemaType) && schemaType !== 'project'),
      // Neues Projekt: Bereich ist schon gesetzt
      {id: 'project-illustration', title: 'Projekt (Illustration)', schemaType: 'project', value: {category: 'illustration'}},
      {id: 'project-design', title: 'Projekt (Design)', schemaType: 'project', value: {category: 'design'}},
    ],
  },

  document: {
    // Einzelseiten: kein Duplizieren/Löschen
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
})

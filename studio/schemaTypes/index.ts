import {project} from './project'
import {about, categoryPage, ctaBlock, home, legal, settings} from './pages'

export const schemaTypes = [project, home, categoryPage, about, legal, ctaBlock, settings]

/** Dokumente, die es genau einmal gibt (feste IDs) */
export const singletonTypes = new Set(['home', 'categoryPage', 'about', 'legal', 'ctaBlock', 'settings'])

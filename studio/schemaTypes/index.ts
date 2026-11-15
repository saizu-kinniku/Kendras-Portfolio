import {project} from './project'
import {about, categoryPage, ctaBlock, deployTrigger, home, legal, settings} from './pages'

export const schemaTypes = [project, home, categoryPage, about, legal, ctaBlock, settings, deployTrigger]

/** Dokumente, die es genau einmal gibt (feste IDs) */
export const singletonTypes = new Set(['home', 'categoryPage', 'about', 'legal', 'ctaBlock', 'settings', 'deployTrigger'])

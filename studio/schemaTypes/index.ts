import {project} from './project'
import {about, home, legal, settings} from './pages'

export const schemaTypes = [project, home, about, legal, settings]

/** Dokumente, die es genau einmal gibt */
export const singletons = [
  {id: 'home', type: 'home', title: 'Startseite'},
  {id: 'about', type: 'about', title: 'About & Contact'},
  {id: 'legal', type: 'legal', title: 'Impressum'},
  {id: 'settings', type: 'settings', title: 'Allgemein'},
] as const

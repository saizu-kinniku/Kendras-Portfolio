import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  // Studio liegt unter /studio der Website – Assets müssen dort referenziert werden
  project: {basePath: '/studio'},
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'kkd7bqq0',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})

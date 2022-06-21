const Path = require('path')
const APP_DIR = process.env.APP_DIR || process.cwd()
const envPath = Path.resolve(__dirname, APP_DIR, '.env')

require('dotenv').config({
  path: envPath,
  override: true,
})

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'

console.log(`NODE_ENV=${process.env.NODE_ENV} APP_DIR=${APP_DIR}`)
const config = module.exports = {
  APP_DIR,
  appName: process.env.APP_NAME,
  appColor: process.env.APP_COLOR,
  port: process.env.PORT,
  url: process.env.URL,
  jlinxHost: process.env.JLINX_HOST,
  jlinxVaultKey: process.env.JLINX_VAULT_KEY,
  sessionSecret: process.env.SESSION_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  otherSites: [
    {
      name: "CatWalkers",
      domain: "cat-walkers.jlinx.test"
    },
    {
      name: "BadBirders",
      domain: "bad-birders.jlinx.test"
    },
    {
      name: "DopeDogs",
      domain: "dope-dogs.jlinx.test"
    },
  ].filter(site => site.name !== process.env.APP_NAME)
}

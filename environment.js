import { fileURLToPath } from 'url'
import Path from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = Path.dirname(__filename)

dotenv.config()

for (const prop of [
  'NODE_ENV',
  'REACT_APP_NAME',
  'REACT_APP_COLOR',
  'PORT',
  'HOST',
  'URL',
  'SESSION_SECRET',
  'DATABASE_URL',
  'CERAMIC_API_URL',
  'CERAMIC_NODE_SECRET',
]){
  if (!process.env[prop]) {
    console.error(`process.env.${prop} is missing!`)
    process.exit(1)
  }
}

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'

const env = {
  APP_ROOT: __dirname,
  BUILD_PATH: Path.join(__dirname, 'client', 'build'),
  NODE_ENV: process.env.NODE_ENV,
  APP_NAME: process.env.REACT_APP_NAME,
  APP_COLOR: process.env.REACT_APP_COLOR,
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  URL: process.env.URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  CERAMIC_API_URL: process.env.CERAMIC_API_URL,
  CERAMIC_NODE_SECRET: process.env.CERAMIC_NODE_SECRET,
}

export default env

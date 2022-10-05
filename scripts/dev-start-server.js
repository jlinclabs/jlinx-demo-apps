#!/usr/bin/env node

process.env.NODE_ENV = 'development'

import Path from 'node:path'
import { createServer } from 'jlinx-demo-app/server/index.js'

process.env.APP_PATH = Path.resolve(process.argv[2])
const server = await createServer({
  port: process.env.PORT,
  appPath: process.env.APP_PATH,
})
await server.start()

#!/usr/bin/env node

import Path from 'node:path'
import { fileURLToPath } from 'url'

process.env.NODE_ENV = 'development'
process.env.APP_PATH = Path.resolve(process.argv[2])
process.env.SHARED_PATH = Path.resolve(fileURLToPath(import.meta.url), '../../shared')

console.log('process.env.SHARED_PATH', process.env.SHARED_PATH)

await (async () => {
  const { createServer } = await import('jlinx-demo-app/server/index.js')
  const server = await createServer()
  await server.start()
})()

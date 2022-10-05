#!/usr/bin/env node

import Path from 'node:path'

process.env.NODE_ENV = 'development'
process.env.APP_PATH = Path.resolve(process.argv[2])

await (async () => {
  const { createServer } = await import('jlinx-demo-app/server/index.js')
  const server = await createServer()
  await server.start()
})()

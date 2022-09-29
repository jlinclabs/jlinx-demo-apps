#!/usr/bin/env node

const APP_PATH = process.argv[2].replace(/\/$/, '')
const path = `../${APP_PATH}/server/index.js`
const { default: server } = await import(path)
await server.start({
  port: process.env.PORT,
  host: process.env.HOST,
})

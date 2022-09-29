import Path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import Router from 'express-promise-router'
import proxy from 'express-http-proxy'

export async function createServer(options = {}){
  console.log('CREATEING DEMO APP SERVERR', options)

  const APP_PATH = process.env.APP_PATH

  const app = express()

  app.start = function(){
    app.server = app.listen(process.env.PORT, () => {
      const { port } = app.server.address()
      const host = `http://localhost:${port}`
      console.log(`Listening on port ${host}`)
    })
  }

  app.use(async (req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
  })

  // app.use(uploads)
  app.use(bodyParser.json({
    limit: 102400 * 10,
  }))

  app.Router = Router
  app.routes = new Router()
  app.use(app.routes)
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok' })
  })

  // app.use(new RPCRouter())

  if (process.env.NODE_ENV === 'production') {
    const buildPath = Path.join(APP_PATH, 'client-build')
    const indexPath = Path.join(buildPath, 'index.html')
    app.use(express.static(buildPath))
    app.get('/*', function (req, res) {
      res.sendFile(indexPath);
    })
  }

  // app.use((req, res, error, next) => { }) // TODO add error handler

  const errorToJson = error => ({
    message: error.message,
    stack: error.stack,
  })

  return app
}

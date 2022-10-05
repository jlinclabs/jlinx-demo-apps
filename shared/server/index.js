import Path from 'path'
import express from 'express'
import bodyParser from 'body-parser'

// import { loadSession } from './controller.js'
import { loadSession } from './session.js'
import { loadQueries, loadCommands } from './cqrs.js'

export async function createServer(options){
  console.log('CREATEING DEMO APP SERVERR', options)

  const app = express()

  app.start = function(){
    app.server = app.listen(options.port, () => {
      const { port } = app.server.address()
      const host = `http://localhost:${port}`
      console.log(`Listening on port ${host}`)
    })
  }

  app.use(async (req, res, next) => {
    // console.log(`${req.method} ${req.url}`)
    await loadSession(req, res)
    console.log('HTTP REQUEST', {
      method: req.method,
      url: req.url,
      session: req.session,
    })
    next()
  })

  // app.use(uploads)
  app.use(bodyParser.json({
    limit: 102400 * 10,
  }))

  // app.Router = Router
  // app.routes = new Router()
  // app.use(app.routes)
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok' })
  })

  const queries = await loadQueries(
    Path.join(options.appPath, 'server/queries')
  )
  const commands = await loadCommands(
    Path.join(options.appPath, 'server/commands')
  )

  app.get('/api/:queryName', async function(req, res, next) {
    const { queryName } = req.params
    console.log('EXEC QUERY', {
      params: req.params,
      url: req.url,
      body: req.body,
    })
    try{
      req.session.query(queryName)
      res.json({
        params: req.params,
        url: req.url,
        body: req.body,
      })
    }catch(error){
      res.status(500).json({
        error: {
          message: error.message,
          stack: error.stack,
        }
      })
    }

  })
  app.post('/api/:commandName', async function(req, res, next) {
    console.log('EXEC COMMAND', {
      params: req.params,
      url: req.url,
      body: req.body,
    })
    res.json({
      params: req.params,
      url: req.url,
      body: req.body,
    })
    // const options = req.body
    // const context = {
    //   // todo session
    // }
    // proceedures.call(options, context)
  })

  if (process.env.NODE_ENV === 'production') {
    const buildPath = Path.join(options.appPath, 'client-build')
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

import Path from 'path'
import express from 'express'
import bodyParser from 'body-parser'

import { ExpectedError } from './errors.js'
import { loadSession } from './session.js'
import { createController } from './controller.js'

// import { loadSession } from './controller.js'
// import { loadQueries, loadCommands } from './cqrs.js'

export async function createServer(){

  const app = express()

  app.start = function(){
    app.server = app.listen(process.env.PORT, () => {
      const { port } = app.server.address()
      const host = `http://localhost:${port}`
      console.log(`Listening on port ${host}`)
    })
  }

  app.use(async (req, res, next) => {
    // console.log(`${req.method} ${req.url}`)
    await loadSession(req, res)
    req.controller = createController({
      session: req.session,
      userId: req.session.userId,
      readOnly: req.session.readOnly,
    })
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

  app.use('/api/:name', async function(req, res, next) {
    const { name } = req.params
    let options, action
    if (req.method === 'GET'){
      action = 'query'
      options = req.query
    }else if (req.method === 'POST'){
      action = 'command'
      options = req.body
    }else{
      return next()
    }
    console.log(action, { name, options })
    try{
      const result = await req.controller[action](name, options)
      console.error(`${action} SUCCESS`, { name, options, result })
      res.status(200).json({ result })
    }catch(error){
      console.error(`${action} FAILED`, { name, options, error })
      renderErrorAsJSON(res, error)
    }
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


async function renderErrorAsJSON(res, error){
  res
    .status(
      error instanceof ExpectedError ? 400 : 500
    )
    .json({
      error: {
        message: error.message,
        stack: error.stack,
      }
    })
}

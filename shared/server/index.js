import Path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import proxy from 'express-http-proxy'

export async function createDemoApp(options = {}){
  const app = express()

  app.start = function(){
    app.server = app.listen(env.PORT, () => {
      const { port } = app.server.address()
      const host = `http://localhost:${port}`
      console.log(`Listening on port ${host}`)
    })
  }

  app.use(async (req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
  })

  app.use(uploads)
  app.use(bodyParser.json({
    limit: 102400 * 10,
  }))

  if (env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
    app.get('/*', function (req, res) {
      res.sendFile(Path.join(env.BUILD_PATH, 'index.html'));
    })
  }

  const errorToJson = error => ({
    message: error.message,
    stack: error.stack,
  })
}

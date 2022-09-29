import env from '../environment.js'
import Path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import proxy from 'express-http-proxy'

import uploads from './uploads.js'
import ceramicRestApi from './ceramicRestApi.js.js'
import jlinxRpcApi from './jlinxRpcApi/index.js.js'
import jlinxRestApi from './jlinxRestApi.js.js'

const app = express()

export default app

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

app.post('/api/v0/streams', proxy(env.CERAMIC_API_URL))

app.use('/api/ceramic', ceramicRestApi)
app.use('/api/ceramic', jlinxRestApi)
app.use('/api/jlinx/v0/rpc', jlinxRpcApi)
app.use('/api/jlinx/v0', jlinxRestApi)

// ROUTES
// const router = Router()
// app.use(router)
// router.use(bodyParser.json({
//   limit: 102400 * 10,
// }))

// router.use(jlinxRpcApi)
// router.use(ceramicRestApi)
// router.use(jlinxRestApi)

// router.use(async (req, res, next) => {
//   req.session = await Session.open(req, res)
//   // req.origin = `${req.protocol}://${req.get('host')}`
//   next()
// })

// router.get('/api/status', (req, res) => {
//   res.send({ ok: true })
// })

// router.get('/api/views/*', async (req, res) => {
//   const viewId = req.params[0]
//   let error, value
//   try{
//     value = await getView({ viewId, session: req.session })
//   }catch(e){
//     error = errorToJson(e)
//   }
//   res.json({ value, error })
// })

// router.post('/api/actions/*', async (req, res) => {
//   const actionId = req.params[0]
//   const options = req.body || {}
//   let error, result
//   try{
//     result = await takeAction({ actionId, session: req.session, options })
//   }catch(e){
//     error = errorToJson(e)
//   }
//   res.json({ result, error })
// })

// router.use((error, req, res, next) => {
//   console.error('ERROR', error)
//   res.status(error.statusCode || 500).json({
//     error: errorToJson(error)
//   })
// })

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

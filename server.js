import env from './environment.js'
import Path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import Router from 'express-promise-router'

import Session from './Session.js'
import { getView, takeAction } from './resources/index.js'

const app = express()

export default app

app.start = function(){
  app.server = app.listen(env.PORT, () => {
    const { port } = app.server.address()
    const host = `http://localhost:${port}`
    console.log(`Listening on port ${host}`)
  })
}

// ROUTES
const router = Router()
app.use(router)
router.use(bodyParser.json({
  limit: 102400 * 10,
}))

router.use(async (req, res, next) => {
  console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.url}`)
  req.session = await Session.open(req, res)
  next()
})

router.get('/api/status', (req, res) => {
  res.send({ ok: true })
})

router.get('/api/views/*', async (req, res) => {
  const viewId = req.params[0]
  const value = await getView({ viewId, session: req.session })
  res.json({ value })
})

router.post('/api/actions/*', async (req, res) => {
  const actionId = req.params[0]
  const options = req.body || {}
  const result = await takeAction({ actionId, session: req.session, options })
  res.json({ result })
})

router.post('/api/jlinx/contracts/signatures', async (req, res) => {
  const { signatureId } = req.body
  const result = await takeAction({
    actionId: 'contracts.ackSignature',
    session: req.session,
    options: { signatureId },
  })
  res.json(result)
})

router.use((error, req, res, next) => {
  console.error('ERROR', error)
  res.status(error.statusCode || 500).json({
    error: {
      message: error.message,
      stack: error.stack,
    }
  })
})

if (env.NODE_ENV === 'production') {
  router.use(express.static('client/build'))
  router.get('/*', function (req, res) {
    res.sendFile(Path.join(env.BUILD_PATH, 'index.html'));
  })
}

require('./environment')
import express from 'express'
import bodyParser from 'body-parser'
import Router from 'express-promise-router'


import Session from './Session'
import { getView, takeAction } from './resources'

const app = express()

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
  // TODO handle glob serving of index.html
}

// ROUTES
const router = Router()
app.use(router)

// router.use(bodyParser.json())
// router.use(bodyParser.urlencoded({ extended: true }))

router.use(async (req, res, next) => {
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

router.post('/api/actions/*', bodyParser.json(), async (req, res) => {
  const actionId = req.params[0]
  const options = req.body || {}
  const result = await takeAction({ actionId, session: req.session, options })
  res.json({ result })
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

const server = app.listen(process.env.PORT, () => {
  const { port } = server.address()
  const host = `http://localhost:${port}`
  console.log(`Listening on port ${host}`)
})

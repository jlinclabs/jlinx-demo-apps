require('./environment')
import express from 'express'
import bodyParser from 'body-parser'
import Session from './Session'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/status', (req, res) => {
  res.send({ ok: true })
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
}

app.use('/api', async (req, res, next) => {
  req.session = await Session.open(req, res)
  next()
})

app.get('/api/views/*viewId', async (req, res, next) => {

})

const server = app.listen(process.env.PORT, () => {
  const { port } = server.address()
  const host = `http://localhost:${port}`
  console.log(`Listening on port ${host}`)
})

require('./environment')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/status', (req, res) => {
  res.send({ ok: true })
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
}

const server = app.listen(process.env.PORT, () => {
  const { port } = server.address()
  const host = `http://localhost:${port}`
  console.log(`Listening on port ${host}`)
})

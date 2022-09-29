import { createDemoApp } from 'jlinx-demo-app/server/index.js'

const server = await createDemoApp({

})

server.routes.get('/api/netrep_test', (req, res) => {
  res.json({
    netrepTest: 'pass',
  })
})

export default server

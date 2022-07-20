const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
  if (!process.env.API_SERVER){
    console.error(`process.env.API_SERVER required`)
    process.exit(1)
  }

  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.API_SERVER,
      changeOrigin: true,
    })
  )
}

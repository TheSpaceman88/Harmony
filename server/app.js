const path = require('path')
const express = require('express')
const apiRoutes = require('./routes/apiRoutes')

function createApp() {
  const app = express()

  app.use(express.json({ limit: '1mb' }))
  app.use(express.static(path.join(__dirname, '..', 'public')))
  app.use('/api', apiRoutes)

  return app
}

module.exports = createApp

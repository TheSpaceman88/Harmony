const createApp = require('./app')
const { port, host } = require('./config/env')

const app = createApp()

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`)
})

const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  port: process.env.PORT || '0.0.0.0',
  host: process.env.HOST || '127.0.0.1',
  impactCo2Token: process.env.IMPACTCO2_TOKEN,
  impactCo2ApiBase: 'https://impactco2.fr/api/v1',
}

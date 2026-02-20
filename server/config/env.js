const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  impactCo2Token: process.env.IMPACTCO2_TOKEN,
  impactCo2ApiBase: 'https://impactco2.fr/api/v1',
}

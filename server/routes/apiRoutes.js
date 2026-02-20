const express = require('express')
const { getOptions, postCompute, postReport } = require('../controllers/bilanController')

const router = express.Router()

router.get('/options', getOptions)
router.post('/compute', postCompute)
router.post('/report', postReport)

module.exports = router

const XLSX = require('xlsx')
const { buildOptions, computeBilan, buildWorkbook } = require('../services/bilanService')
const { sendJson, sendError, sendWorkbook } = require('../views/apiView')

async function getOptions(req, res) {
  try {
    const categories = await buildOptions()
    sendJson(res, { categories })
  } catch (error) {
    sendError(res, error)
  }
}

async function postCompute(req, res) {
  try {
    const result = await computeBilan(req.body)
    sendJson(res, result)
  } catch (error) {
    sendError(res, error)
  }
}

async function postReport(req, res) {
  try {
    const { rows, totalKg, totalsByCategory } = await computeBilan(req.body)
    const workbook = buildWorkbook(rows, totalKg, totalsByCategory)
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    const date = new Date().toISOString().slice(0, 10)
    const filename = `bilan-carbone-${date}.xlsx`
    sendWorkbook(res, buffer, filename)
  } catch (error) {
    sendError(res, error)
  }
}

module.exports = {
  getOptions,
  postCompute,
  postReport,
}

function sendJson(res, payload, status = 200) {
  res.status(status).json(payload)
}

function sendError(res, error) {
  const status = error.status || 500
  res.status(status).json({ error: error.message || 'Erreur serveur' })
}

function sendWorkbook(res, buffer, filename) {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(buffer)
}

module.exports = {
  sendJson,
  sendError,
  sendWorkbook,
}

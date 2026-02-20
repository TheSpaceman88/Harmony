async function parseError(response, fallbackMessage) {
  let message = fallbackMessage
  try {
    const errorData = await response.json()
    if (errorData && errorData.error) {
      message = errorData.error
    }
  } catch (error) {
    // Ignore JSON parsing errors from non-JSON responses.
  }
  return message
}

async function fetchOptions() {
  const response = await fetch('/api/options')
  if (!response.ok) {
    const message = await parseError(response, 'Impossible de charger les options')
    throw new Error(message)
  }
  return response.json()
}

async function computeBilan(payload) {
  const response = await fetch('/api/compute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Erreur de calcul')
  }

  return data
}

async function fetchReport(payload) {
  const response = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await parseError(response, 'Erreur de génération')
    throw new Error(message)
  }

  return response.blob()
}

export {
  fetchOptions,
  computeBilan,
  fetchReport,
}

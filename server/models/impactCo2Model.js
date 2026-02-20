const fetch = require('node-fetch')
const { getCache, setCache } = require('./cacheModel')
const { impactCo2ApiBase, impactCo2Token } = require('../config/env')

const ONE_HOUR_MS = 60 * 60 * 1000

function ensureToken() {
  if (!impactCo2Token) {
    const error = new Error('IMPACTCO2_TOKEN est manquant')
    error.status = 500
    throw error
  }
}

function buildUrl(pathname, params = {}) {
  const prefix = pathname.startsWith('/') ? '' : '/'
  const url = new URL(`${impactCo2ApiBase}${prefix}${pathname}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url
}

async function apiGet(pathname, params) {
  ensureToken()
  const url = buildUrl(pathname, params)

  const response = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${impactCo2Token}`,
    },
  })

  if (!response.ok) {
    const details = await response.text()
    const error = new Error(`ImpactCO2 API error ${response.status}: ${details}`)
    error.status = 502
    throw error
  }

  return response.json()
}

async function getThematiqueItems(slug) {
  const cacheKey = `thematique:${slug}`
  const cached = getCache(cacheKey)
  if (cached) return cached

  const json = await apiGet(`/thematiques/ecv/${slug}`, { language: 'fr' })
  const items = Array.isArray(json.data) ? json.data : []
  setCache(cacheKey, items, ONE_HOUR_MS)
  return items
}

async function getAlimentationRepasItems() {
  const cacheKey = 'alimentation:repas'
  const cached = getCache(cacheKey)
  if (cached) return cached

  const items = await getThematiqueItems('alimentation')
  const repas = items.filter((item) => String(item.slug || '').startsWith('repas'))
  setCache(cacheKey, repas, ONE_HOUR_MS)
  return repas
}

async function getTransportOptions() {
  const cacheKey = 'transport:options'
  const cached = getCache(cacheKey)
  if (cached) return cached

  const json = await apiGet('/transport', { km: 1, displayAll: 1, language: 'fr' })
  const options = Array.isArray(json.data) ? json.data : []
  setCache(cacheKey, options, ONE_HOUR_MS)
  return options
}

async function computeTransport(transportId, km) {
  const json = await apiGet('/transport', {
    km,
    transports: transportId,
    language: 'fr',
  })

  const items = Array.isArray(json.data) ? json.data : []
  return items.find((item) => Number(item.id) === Number(transportId))
}

module.exports = {
  getThematiqueItems,
  getAlimentationRepasItems,
  getTransportOptions,
  computeTransport,
}

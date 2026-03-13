const XLSX = require('xlsx')
const { getCategories } = require('../models/categoriesModel')
const {
  getThematiqueItems,
  getAlimentationRepasItems,
  getTransportOptions,
  computeTransport,
} = require('../models/impactCo2Model')

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function filterItemsForCategory(category, items) {
  if (category.slug === 'usagenumerique') {
    const allowedSlugs = new Set(['email', 'visioconference', 'stockagedonnee'])
    return items.filter((item) => allowedSlugs.has(String(item.slug || '').toLowerCase()))
  }

  if (category.slug === 'boisson') {
    return items.filter((item) => {
      const slug = String(item.slug || '').toLowerCase()
      const name = String(item.name || '').toLowerCase()
      return slug !== 'eau-du-robinet' && name !== 'eau du robinet'
    })
  }

  return items
}

async function buildOptions() {
  const categories = getCategories()
  const result = []

  for (const category of categories) {
    if (category.type === 'transport') {
      const options = await getTransportOptions()
      result.push({
        ...category,
        options: options.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      })
      continue
    }

    if (category.type === 'alimentation_repas') {
      const options = await getAlimentationRepasItems()
      result.push({
        ...category,
        options: options.map((item) => ({
          value: item.slug,
          label: item.name,
          factor: item.ecv,
        })),
      })
      continue
    }

    if (category.type === 'thematique') {
      const thematiqueItems = await getThematiqueItems(category.slug)
      const options = filterItemsForCategory(category, thematiqueItems)
      result.push({
        ...category,
        options: options.map((item) => ({
          value: item.slug,
          label: item.name,
          factor: item.ecv,
        })),
      })
      continue
    }

    result.push({ ...category, options: [] })
  }

  return result
}

async function computeBilan(payload) {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('Payload invalide')
    error.status = 400
    throw error
  }

  const rows = []
  const totalsByCategory = {}
  const categoriesInput = payload.categories || {}
  const categories = getCategories()

  for (const category of categories) {
    const input = categoriesInput[category.key]
    if (!input) continue

    const entries = Array.isArray(input) ? input : [input]

    if (category.type === 'transport') {
      for (const entry of entries) {
        const transportId = toNumber(entry.transportId)
        const km = toNumber(entry.km)
        const trips = toNumber(entry.trips) || 1

        if (!transportId || !km || km <= 0 || trips <= 0) continue

        const transport = await computeTransport(transportId, km)
        if (!transport) continue

        const value = toNumber(transport.value)
        if (value === null) continue

        const totalEmission = value * trips
        const valuePerKm = value / km
        const totalKm = km * trips
        const itemLabel = trips > 1 ? `${transport.name} (x${trips})` : transport.name

        rows.push({
          categoryKey: category.key,
          categoryLabel: category.label,
          itemLabel,
          itemSlug: String(transportId),
          quantity: totalKm,
          unit: 'km',
          factor: valuePerKm,
          emissionsKg: totalEmission,
        })

        totalsByCategory[category.label] = (totalsByCategory[category.label] || 0) + totalEmission
      }
      continue
    }

    let items = []
    if (category.type === 'alimentation_repas') {
      items = await getAlimentationRepasItems()
    } else if (category.type === 'thematique') {
      items = await getThematiqueItems(category.slug)
    }
    items = filterItemsForCategory(category, items)

    for (const entry of entries) {
      const slug = typeof entry.slug === 'string' ? entry.slug : null
      const quantity = toNumber(entry.quantity)

      if (!slug || !quantity || quantity <= 0) continue

      const item = items.find((itemEntry) => itemEntry.slug === slug)
      if (!item) continue

      const factor = toNumber(item.ecv)
      if (factor === null) continue

      const totalEmission = factor * quantity

      rows.push({
        categoryKey: category.key,
        categoryLabel: category.label,
        itemLabel: item.name,
        itemSlug: item.slug,
        quantity,
        unit: 'unité',
        factor,
        emissionsKg: totalEmission,
      })

      totalsByCategory[category.label] = (totalsByCategory[category.label] || 0) + totalEmission
    }
  }

  const totalKg = rows.reduce((sum, row) => sum + row.emissionsKg, 0)
  return { rows, totalKg, totalsByCategory }
}

function buildWorkbook(rows, totalKg, totalsByCategory) {
  const wsData = [
    ['Catégorie', 'Élément', 'Quantité', 'Unité', 'Facteur (kgCO2e/unité)', 'Émissions (kgCO2e)'],
  ]

  rows.forEach((row) => {
    wsData.push([row.categoryLabel, row.itemLabel, row.quantity, row.unit, row.factor, row.emissionsKg])
  })

  wsData.push([])
  wsData.push(['TOTAL', '', '', '', '', totalKg])

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, 'Bilan')

  const summaryData = [['Catégorie', 'Émissions (kgCO2e)']]
  Object.entries(totalsByCategory).forEach(([label, value]) => {
    summaryData.push([label, value])
  })
  summaryData.push(['TOTAL', totalKg])

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Résumé')

  return wb
}

module.exports = {
  buildOptions,
  computeBilan,
  buildWorkbook,
}

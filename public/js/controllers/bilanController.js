import { fetchOptions, computeBilan, fetchReport } from '../models/bilanApiModel.js'

export function createBilanController({ formElement, categoriesView, statusView, resultsView }) {
  let lastPayload = null

  async function init() {
    statusView.setStatus('Chargement des catégories...')

    try {
      const data = await fetchOptions()
      categoriesView.renderCategories(data.categories)
      statusView.clearStatus()
    } catch (error) {
      statusView.setStatus(error.message || 'Erreur de chargement', 'error')
    }
  }

  async function onSubmit(event) {
    event.preventDefault()
    statusView.clearStatus()

    const payload = categoriesView.buildPayload()
    if (!Object.keys(payload.categories).length) {
      statusView.setStatus('Sélectionnez au moins une catégorie et remplissez les champs.', 'error')
      return
    }

    statusView.setStatus('Calcul en cours...')
    resultsView.setDownloadEnabled(false)

    try {
      const data = await computeBilan(payload)
      resultsView.renderResults(data.rows, data.totalKg)
      lastPayload = payload
      resultsView.setDownloadEnabled(true)
      statusView.clearStatus()
    } catch (error) {
      statusView.setStatus(error.message || 'Erreur de calcul', 'error')
    }
  }

  async function onDownload() {
    if (!lastPayload) return

    statusView.setStatus('Génération du fichier Excel...')

    try {
      const blob = await fetchReport(lastPayload)
      resultsView.downloadBlob(blob, 'bilan-carbone.xlsx')
      statusView.clearStatus()
    } catch (error) {
      statusView.setStatus(error.message || 'Erreur de génération', 'error')
    }
  }

  function bind(downloadButton) {
    formElement.addEventListener('submit', onSubmit)
    downloadButton.addEventListener('click', onDownload)
  }

  return {
    init,
    bind,
  }
}

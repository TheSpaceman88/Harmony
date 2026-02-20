function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function createResultsView({ resultsElement, tableBodyElement, totalElement, downloadButton }) {
  function renderResults(rows, totalKg) {
    tableBodyElement.innerHTML = ''

    rows.forEach((row) => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${row.categoryLabel}</td>
        <td>${row.itemLabel}</td>
        <td>${formatNumber(row.quantity)}</td>
        <td>${row.unit}</td>
        <td>${formatNumber(row.factor)}</td>
        <td>${formatNumber(row.emissionsKg)}</td>
      `
      tableBodyElement.appendChild(tr)
    })

    totalElement.textContent = formatNumber(totalKg)
    resultsElement.classList.remove('hidden')
  }

  function setDownloadEnabled(enabled) {
    downloadButton.disabled = !enabled
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return {
    renderResults,
    setDownloadEnabled,
    downloadBlob,
  }
}

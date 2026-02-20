export function createStatusView(statusElement) {
  function setStatus(message, type = 'info') {
    statusElement.textContent = message
    statusElement.dataset.type = type
  }

  function clearStatus() {
    statusElement.textContent = ''
    statusElement.dataset.type = ''
  }

  return {
    setStatus,
    clearStatus,
  }
}

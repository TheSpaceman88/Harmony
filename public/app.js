import { createBilanController } from './js/controllers/bilanController.js'
import { createCategoriesView } from './js/views/categoriesView.js'
import { createStatusView } from './js/views/statusView.js'
import { createResultsView } from './js/views/resultsView.js'

const formElement = document.getElementById('bilan-form')
const statusElement = document.getElementById('status')
const categoriesElement = document.getElementById('categories')
const resultsElement = document.getElementById('results')
const tableBodyElement = document.querySelector('#results-table tbody')
const totalElement = document.getElementById('total-kg')
const downloadButton = document.getElementById('download')

const categoriesView = createCategoriesView(categoriesElement)
const statusView = createStatusView(statusElement)
const resultsView = createResultsView({
  resultsElement,
  tableBodyElement,
  totalElement,
  downloadButton,
})

const controller = createBilanController({
  formElement,
  categoriesView,
  statusView,
  resultsView,
})

controller.bind(downloadButton)
controller.init()

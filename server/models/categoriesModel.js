const categories = require('../config/categories.json')

function getCategories() {
  return categories
}

module.exports = {
  getCategories,
}

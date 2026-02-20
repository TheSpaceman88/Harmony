function createField(label, input) {
  const wrapper = document.createElement('div')
  wrapper.className = 'field'
  const labelEl = document.createElement('label')
  labelEl.textContent = label
  wrapper.appendChild(labelEl)
  wrapper.appendChild(input)
  return wrapper
}

function buildSelect(options, placeholder) {
  const select = document.createElement('select')
  const empty = document.createElement('option')
  empty.value = ''
  empty.textContent = placeholder
  select.appendChild(empty)

  options.forEach((option) => {
    const opt = document.createElement('option')
    opt.value = option.value
    opt.textContent = option.label
    select.appendChild(opt)
  })

  return select
}

function buildNumberInput(step = '1', min = '0') {
  const input = document.createElement('input')
  input.type = 'number'
  input.step = step
  input.min = min
  return input
}

function renderCategoryCard(category, index) {
  const card = document.createElement('div')
  card.className = 'category-card'
  card.style.animationDelay = `${index * 0.05}s`
  card.dataset.categoryKey = category.key
  card.dataset.categoryType = category.type

  const header = document.createElement('div')
  header.className = 'category-header'

  const title = document.createElement('h3')
  title.className = 'category-title'
  title.textContent = category.label

  const toggleLabel = document.createElement('label')
  toggleLabel.className = 'toggle'
  const toggle = document.createElement('input')
  toggle.type = 'checkbox'
  toggleLabel.appendChild(toggle)
  toggleLabel.appendChild(document.createTextNode('Inclure'))

  header.appendChild(title)
  header.appendChild(toggleLabel)

  const fields = document.createElement('div')
  fields.className = 'fields'

  if (category.type === 'transport') {
    const select = buildSelect(category.options || [], 'Type de transport')
    select.name = 'transportId'

    const kmInput = buildNumberInput('1', '0')
    kmInput.name = 'km'

    const tripsInput = buildNumberInput('1', '1')
    tripsInput.name = 'trips'
    tripsInput.value = '1'

    fields.appendChild(createField('Transport', select))
    fields.appendChild(createField('Distance (km)', kmInput))
    fields.appendChild(createField(category.quantityLabel || 'Nombre de trajets', tripsInput))
  } else {
    const select = buildSelect(category.options || [], 'Choisir un élément')
    select.name = 'item'

    const quantityInput = buildNumberInput('0.01', '0')
    quantityInput.name = 'quantity'

    fields.appendChild(createField('Élément', select))
    fields.appendChild(createField(category.quantityLabel || 'Quantité', quantityInput))
  }

  card.appendChild(header)
  card.appendChild(fields)

  toggle.addEventListener('change', () => {
    const inputs = card.querySelectorAll('select, input[type="number"]')
    inputs.forEach((input) => {
      input.disabled = !toggle.checked
    })
  })

  toggle.dispatchEvent(new Event('change'))

  return card
}

export function createCategoriesView(containerElement) {
  function renderCategories(categories) {
    containerElement.innerHTML = ''
    categories.forEach((category, index) => {
      containerElement.appendChild(renderCategoryCard(category, index))
    })
  }

  function buildPayload() {
    const payload = { categories: {} }
    const cards = containerElement.querySelectorAll('.category-card')

    cards.forEach((card) => {
      const key = card.dataset.categoryKey
      const type = card.dataset.categoryType
      const toggle = card.querySelector('input[type="checkbox"]')

      if (!toggle.checked) return

      if (type === 'transport') {
        const transportId = Number(card.querySelector('[name="transportId"]').value)
        const km = Number(card.querySelector('[name="km"]').value)
        const trips = Number(card.querySelector('[name="trips"]').value) || 1

        if (transportId && km > 0) {
          payload.categories[key] = { transportId, km, trips }
        }
        return
      }

      const slug = card.querySelector('[name="item"]').value
      const quantity = Number(card.querySelector('[name="quantity"]').value)

      if (slug && quantity > 0) {
        payload.categories[key] = { slug, quantity }
      }
    })

    return payload
  }

  return {
    renderCategories,
    buildPayload,
  }
}

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

function createItemEntry(category, options) {
  const row = document.createElement('div')
  row.className = 'item-entry'

  const select = buildSelect(options || [], 'Choisir un élément')
  select.name = 'item'

  const quantityInput = buildNumberInput('0.01', '0')
  quantityInput.name = 'quantity'

  const removeButton = document.createElement('button')
  removeButton.type = 'button'
  removeButton.className = 'entry-remove'
  removeButton.textContent = 'Supprimer'

  row.appendChild(createField('Élément', select))
  row.appendChild(createField(category.quantityLabel || 'Quantité', quantityInput))
  row.appendChild(removeButton)

  return row
}

function createTransportEntry(category, options) {
  const row = document.createElement('div')
  row.className = 'transport-entry'

  const select = buildSelect(options || [], 'Type de transport')
  select.name = 'transportId'

  const kmInput = buildNumberInput('1', '0')
  kmInput.name = 'km'

  const tripsInput = buildNumberInput('1', '1')
  tripsInput.name = 'trips'
  tripsInput.value = '1'

  const removeButton = document.createElement('button')
  removeButton.type = 'button'
  removeButton.className = 'entry-remove'
  removeButton.textContent = 'Supprimer'

  row.appendChild(createField('Transport', select))
  row.appendChild(createField('Distance (km)', kmInput))
  row.appendChild(createField(category.quantityLabel || 'Nombre de trajets', tripsInput))
  row.appendChild(removeButton)

  return row
}

function renderCategoryCard(category, index) {
  const card = document.createElement('div')
  card.className = 'category-card'
  if (category.type === 'transport') {
    card.classList.add('category-card--transport')
  }
  card.style.animationDelay = `${index * 0.05}s`
  card.dataset.categoryKey = category.key
  card.dataset.categoryType = category.type

  const header = document.createElement('div')
  header.className = 'category-header'

  const titleBlock = document.createElement('div')
  titleBlock.className = 'category-title-block'

  const title = document.createElement('h3')
  title.className = 'category-title'
  title.textContent = category.label

  titleBlock.appendChild(title)

  if (typeof category.description === 'string' && category.description.trim()) {
    const description = document.createElement('p')
    description.className = 'category-description'
    description.textContent = category.description.trim()
    titleBlock.appendChild(description)
  }

  const toggleLabel = document.createElement('label')
  toggleLabel.className = 'toggle'
  const toggle = document.createElement('input')
  toggle.type = 'checkbox'
  toggleLabel.appendChild(toggle)
  toggleLabel.appendChild(document.createTextNode('Inclure'))

  header.appendChild(titleBlock)
  header.appendChild(toggleLabel)

  const fields = document.createElement('div')
  fields.className = 'fields'

  if (category.type === 'transport') {
    const entries = document.createElement('div')
    entries.className = 'transport-entries'

    const addButton = document.createElement('button')
    addButton.type = 'button'
    addButton.className = 'entry-add'
    addButton.textContent = 'Ajouter un transport'

    const appendEntry = () => {
      const entry = createTransportEntry(category, category.options)
      const removeButton = entry.querySelector('.entry-remove')
      removeButton.addEventListener('click', () => {
        const allEntries = entries.querySelectorAll('.transport-entry')
        if (allEntries.length === 1) {
          entry.querySelector('[name="transportId"]').value = ''
          entry.querySelector('[name="km"]').value = ''
          entry.querySelector('[name="trips"]').value = '1'
          return
        }
        entry.remove()
      })
      entries.appendChild(entry)
    }

    appendEntry()
    addButton.addEventListener('click', appendEntry)

    fields.appendChild(entries)
    fields.appendChild(addButton)
  } else {
    const entries = document.createElement('div')
    entries.className = 'item-entries'

    const addButton = document.createElement('button')
    addButton.type = 'button'
    addButton.className = 'entry-add'
    addButton.textContent = 'Ajouter un élément'

    const appendEntry = () => {
      const entry = createItemEntry(category, category.options)
      const removeButton = entry.querySelector('.entry-remove')
      removeButton.addEventListener('click', () => {
        const allEntries = entries.querySelectorAll('.item-entry')
        if (allEntries.length === 1) {
          entry.querySelector('[name="item"]').value = ''
          entry.querySelector('[name="quantity"]').value = ''
          return
        }
        entry.remove()
      })
      entries.appendChild(entry)
    }

    appendEntry()
    addButton.addEventListener('click', appendEntry)

    fields.appendChild(entries)
    fields.appendChild(addButton)
  }

  card.appendChild(header)
  card.appendChild(fields)

  toggle.addEventListener('change', () => {
    const inputs = card.querySelectorAll('select, input[type="number"], .entry-add, .entry-remove')
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
        const entries = Array.from(card.querySelectorAll('.transport-entry'))
        const transports = entries
          .map((entry) => {
            const transportId = Number(entry.querySelector('[name="transportId"]').value)
            const km = Number(entry.querySelector('[name="km"]').value)
            const trips = Number(entry.querySelector('[name="trips"]').value) || 1
            return { transportId, km, trips }
          })
          .filter((entry) => entry.transportId && entry.km > 0 && entry.trips > 0)

        if (transports.length) {
          payload.categories[key] = transports
        }
        return
      }

      const entries = Array.from(card.querySelectorAll('.item-entry'))
      const items = entries
        .map((entry) => {
          const slug = entry.querySelector('[name="item"]').value
          const quantity = Number(entry.querySelector('[name="quantity"]').value)
          return { slug, quantity }
        })
        .filter((item) => item.slug && item.quantity > 0)

      if (items.length) {
        payload.categories[key] = items
      }
    })

    return payload
  }

  return {
    renderCategories,
    buildPayload,
  }
}

import clickHandler from './clickHelper.js'
import enums from './enums.js'
import { buildNodesMap, getSelectedValues, selectNode } from './nodesHeleper.js'

const arrow = '▲'
const listItemClass = 'dropdown__list-item'
const listItemTag = 'li'


const createElement = (tag, className, id = null) => {
  const element = document.createElement(tag)
  element.className = className
  if (id) {
    element.id = id
  }

  return element
}

const createTextElement = (className, textContent = null, id = null) => {
  const element = createElement('span', className, id)

  if (textContent !== null) {
    element.textContent = textContent
  }

  return element
}

const dfsId = (options, value) => {
    for (const option of options) {
      if (option.id == value) {
        return option
      } else {
        if (option.children?.length) {
          const foundElement = dfsId(option.children, value)

          if (foundElement) {
            return foundElement
          }
        }
      }
    }

    return null
}

export default class Dropdown {
  constructor ({
    options, // Array
    id, // Number | String
    value, // Number | String | Array<Number | String>
    isMultiple
  }) {
    this.options = options
    this.id = id
    this.value = value
    this.isExpanded = false
    this.isMultiple = isMultiple

    if (isMultiple) {
      this.nodesMap = buildNodesMap(options, value)
    }

    this.mount()
  }

  get selectedValue () {
    if (this.isMultiple) {
      return getSelectedValues(this.nodesMap)
    } else {
      const existingNode = dfsId(this.options, this.value)

      return existingNode?.value ?? '__Nothing is Selected'
    }
  }

  mount () {
    const root = document.getElementById(this.id)
    this.root = root
    root.className = 'dropdown'
    root.dataset.type = enums.ElementTypes.Root
    root.innerHTML = ''

    this.selectedValueElement = createTextElement('dropdown__header-text', this.selectedValue)
    root.appendChild(this.selectedValueElement)

    this.arrowElement = createTextElement('dropdown__arrow dropdown__header-arrow', arrow)
    root.appendChild(this.arrowElement)

    this.optionsListElement = createElement('ul', 'dropdown__options-list')
    this.optionsListElement.style.display = 'none'
    document.body.appendChild(this.optionsListElement)
    
    this.createOptionElements(this.options, 0, this.optionsListElement)

    window.addEventListener('click', (e) => clickHandler(e, this))
  }

  createOptionElements (options, depthLevel, listElement) {
    for (const option of options) {
      const listItem = createElement(listItemTag, listItemClass)
      listElement.appendChild(listItem)
      const subTitle = createTextElement('dropdown__item-label-container', null, option.id)
      subTitle.dataset.type = enums.ElementTypes.LabelContainer
      listItem.appendChild(subTitle)
      const itemLabel = createTextElement('dropdown__item-label', option.value)

      if (option.children?.length) {
        const subList = createElement('ul', 'dropdown__options-sublist')
        subList.style.marginLeft = `${depthLevel * 20}px`
        const subListArrow = createTextElement('dropdown__list-item-arrow dropdown__arrow', arrow)
        subListArrow.dataset.type = enums.ElementTypes.SublistToggle
        subTitle.appendChild(subListArrow)
        subTitle.appendChild(itemLabel)
        listItem.appendChild(subList)
        this.createOptionElements(option.children, depthLevel + 1, subList)
      } else {
        subTitle.appendChild(itemLabel)
      }
    }
  }

  selectValue (value) {
    if (this.isMultiple) {
      selectNode(this.nodesMap, value)
    } else {
      this.value = value
    }

    this.selectedValueElement.textContent = this.selectedValue
  }

  closeDropdown () {
    if (!this.isExpanded) {
      return
    }

    this.isExpanded = false
    this.optionsListElement.style.display = 'none'
  }
}

import clickHandler from './clickHelper.js'
import enums from './enums.js'
import constants from './constants.js'
import { buildNodesMap, getSelectedIds, selectNode, getSelectedValuesByParentPriority } from './nodesHeleper.js'


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
    options,
    id,
    value,
    isMultiple,
    maxHeight
  }) {
    this.options = options
    this.id = id
    this.value = value
    this.isExpanded = false
    this.isMultiple = isMultiple
    this.maxHeight = maxHeight ?? constants.defaultMaxWidth

    if (isMultiple) {
      this.nodesMap = buildNodesMap(options, value)
    }

    this.mount()
  }

  get selectedValue () {
    if (this.isMultiple) {
      return getSelectedValuesByParentPriority(this.nodesMap)
    } else {
      const existingNode = dfsId(this.options, this.value)

      return existingNode?.value ?? constants.texts.nothingIsSelected
    }
  }

  get eventNameParamsMap () {
    return new Map([
      [enums.EventNames.Open, {}],
      [enums.EventNames.Select, this.value],
      [enums.EventNames.Close, this.value]
    ])
  }

  mount () {
    const root = document.getElementById(this.id)
    this.root = root
    root.className = constants.classes.root
    root.dataset.type = enums.ElementTypes.Root
    root.innerHTML = ''

    this.selectedValueElement = createTextElement(constants.classes.headerText, this.selectedValue)
    root.appendChild(this.selectedValueElement)

    this.arrowElement = createTextElement(`${constants.classes.arrow} ${constants.classes.headerArrow}`)
    root.appendChild(this.arrowElement)

    this.optionsListElement = createElement('ul', constants.classes.optionsList)
    this.optionsListElement.style.display = 'none'
    this.optionsListElement.style.maxHeight = `${this.maxHeight}px`
    document.body.appendChild(this.optionsListElement)
    
    this.createOptionElements(this.options, 0, this.optionsListElement)

    window.addEventListener('click', (e) => clickHandler(e, this))
  }

  createOptionElements (options, depthLevel, listElement) {
    for (const option of options) {
      const listItem = createElement('li', constants.classes.listItem)
      listElement.appendChild(listItem)
      const subTitle = createTextElement(constants.classes.subTitle, null, option.id)
      subTitle.style.paddingLeft = `${depthLevel * 20}px`
      subTitle.dataset.type = enums.ElementTypes.LabelContainer
      listItem.appendChild(subTitle)
      const itemLabel = createTextElement(constants.classes.itemLabel, option.value)

      if (option.children?.length) {
        const subList = createElement('ul', constants.classes.sublist)
        const subListArrow = createTextElement(`${constants.classes.arrow} ${constants.classes.listItemArrow}`)
        subListArrow.dataset.type = enums.ElementTypes.SublistToggle
        subTitle.appendChild(subListArrow)

        if (this.isMultiple) {
          this.appendCheckbox(subTitle, option)
        }

        subTitle.appendChild(itemLabel)
        listItem.appendChild(subList)
        this.createOptionElements(option.children, depthLevel + 1, subList)
      } else {
        if (this.isMultiple) {
          this.appendCheckbox(subTitle, option)
        }

        subTitle.appendChild(itemLabel)
      }
    }
  }

  appendCheckbox (subTitle, option) {
    const subListCheckbox = createTextElement(constants.classes.checkbox)
    const node = this.nodesMap.get(option.id.toString())

    if (node.isAllSelected) {
      subListCheckbox.classList.add(constants.classes.checkboxChecked)
    } else if (node.isAnySelected) {
      subListCheckbox.classList.add(constants.classes.checkboxPartiallyChecked)
    }
  
    subTitle.appendChild(subListCheckbox)
  }

  selectValue (value) {
    if (this.isMultiple) {
      selectNode(this.nodesMap, value)
      this.value = getSelectedIds(this.nodesMap)
    } else {
      this.value = value
    }

    this.selectedValueElement.textContent = this.selectedValue
    this.emit(enums.EventNames.Select)
  }

  closeDropdown () {
    if (!this.isExpanded) {
      return
    }

    this.isExpanded = false
    this.optionsListElement.style.display = 'none'
    this.emit(enums.EventNames.Close)
  }

  emit (eventName) {
    const params = this.eventNameParamsMap.get(eventName)
    const event = new CustomEvent(eventName, { detail: params })
    this.root.dispatchEvent(event)
  }
}

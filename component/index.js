import clickHandler, { getEntrylistId } from './clickHelper.js'
import enums from './enums.js'
import constants from './constants.js'
import { buildNodesMap, getSelectedIds, selectNode, getSelectedValuesByParentPriority } from './nodesHeleper.js'
import { rootEventHandler, mouseMoveHandler } from './keyboardHelper.js'

const validateOptions = (options) => {
  return options.every(option => {
    const areChildrenValid = option.children
      ? validateOptions(option.children)
      : true

    return option.hasOwnProperty('id') && option.hasOwnProperty('value') && areChildrenValid
  })
}

const dfsInOptions = (value, options) => {
  if (options.some(x => x.id === value)) {
    return true
  }

  return options.some(x => {
    return x.children
      ? dfsInOptions(value, x.children)
      : false
  })
}

const validateValue = (options, value) => {
  if (value === null) {
    return true
  }

  if (typeof(value) === 'array' || typeof(value) === 'string' || typeof(value) === 'number') {
    const values = typeof(value) === 'array'
      ? value
      : [value]
    
    return values.every(x => dfsInOptions(x, options))    
  } else {
    return false
  }
}

const validateMultiple = (value, isMultiple) => {
  const isValueMultiple = typeof(value) === 'array'

  if (!typeof(isMultiple) === 'boolean') {
    return false
  }

  return isMultiple
    ? true
    : !isValueMultiple
}

const validateMaxHeight = (maxHeight) => {
  return maxHeight
    ? typeof(maxHeight) === 'number' && maxHeight > 0
    : true
}

const validateId = (id) => {
  return typeof(id) === 'number' || typeof(id) === 'string'
}

const validateProps = ({
  options,
  id,
  value,
  isMultiple,
  maxHeight
}) => {
  return validateOptions(options) &&
    validateValue(options, value) &&
    validateMultiple(value, isMultiple) &&
    validateMaxHeight(maxHeight) &&
    validateId(id)
}

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
  constructor (props) {
    if (!validateProps(props)) {
      throw 'Invalid props!';
    }

    const {
      options,
      id,
      value,
      isMultiple,
      maxHeight,
      placeholderText
    } = props

    this.options = options
    this.id = id
    this.value = value
    this.isExpanded = false
    this.isMultiple = isMultiple
    this.maxHeight = maxHeight ?? constants.defaultMaxWidth
    this.placeholderText = placeholderText ?? constants.texts.nothingIsSelected

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

      return existingNode?.value ?? this.placeholderText
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
    root.tabIndex = '0'
    root.addEventListener('keydown', (e) => rootEventHandler(e, this))

    this.selectedValueElement = createTextElement(constants.classes.headerText, this.selectedValue)
    root.appendChild(this.selectedValueElement)

    this.arrowElement = createTextElement(`${constants.classes.arrow} ${constants.classes.headerArrow}`)
    root.appendChild(this.arrowElement)

    this.optionsListElement = createElement('ul', constants.classes.optionsList, getEntrylistId(this.id))
    this.optionsListElement.dataset.type = enums.ElementTypes.EntryList
    this.optionsListElement.addEventListener('mousemove', (e) => mouseMoveHandler(e, this))
    this.optionsListElement.style.opacity = '0'
    this.optionsListElement.style.height = '0'
    this.optionsListElement.style.maxHeight = `${this.maxHeight}px`
    document.body.appendChild(this.optionsListElement)
    
    this.createOptionElements(this.options, 0, this.optionsListElement)

    window.addEventListener('click', (e) => clickHandler(e, this))
  }

  createOptionElements (options, depthLevel, listElement) {
    for (const option of options) {
      const listItem = createElement('li', constants.classes.listItem, option.id)
      listElement.appendChild(listItem)
      const subTitle = createTextElement(constants.classes.subTitle, null)
      subTitle.style.paddingLeft = `${depthLevel * 30 + 5}px`
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

    this.updateActiveElement(listElement.childNodes[0])
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

  openDropdown () {
    if (this.isExpanded) {
      return
    }

    this.arrowElement.classList.toggle(constants.classes.headerArrowExpanded)
    this.isExpanded = true
    this.emit(enums.EventNames.Open)
    const rootRect = this.root.getBoundingClientRect()
    this.root.classList.toggle(constants.classes.rootOpen)
    const listStyle = this.optionsListElement.style
    listStyle.opacity = 1
    listStyle.height = 'auto'
    listStyle.left = `${rootRect.left}px`
    listStyle.top = `${rootRect.bottom}px`
    listStyle.right = `${document.body.getBoundingClientRect().right - rootRect.right}px`
  }

  closeDropdown () {
    if (!this.isExpanded) {
      return
    }

    this.root.classList.toggle(constants.classes.rootOpen)
    this.arrowElement.classList.toggle(constants.classes.headerArrowExpanded)
    this.isExpanded = false
    this.emit(enums.EventNames.Close)
    this.optionsListElement.style.opacity = '0'
    this.optionsListElement.style.height = '0'
  }

  emit (eventName) {
    const params = this.eventNameParamsMap.get(eventName)
    const event = new CustomEvent(eventName, { detail: params })
    this.root.dispatchEvent(event)
  }

  updateActiveElement (newActiveElement) {
    this.activeElement?.classList?.toggle(constants.classes.listItemActive)
    newActiveElement.classList.toggle(constants.classes.listItemActive)
    this.activeElement = newActiveElement
  }
}

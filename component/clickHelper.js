import constants from './constants.js'
import enums from './enums.js'

const sublistToggleClickHandler = (clickedElement) => {
  const affectedListItem = clickedElement.parentElement.parentElement
  affectedListItem.classList.toggle(constants.classes.listItemExpanded)
}

const labelContainerClickHandler = (clickedElement, dropdown) => {
  const affectedListItem = clickedElement.parentElement
  dropdown.selectValue(affectedListItem.id)

  if (dropdown.isMultiple) {
    const affectedChildNodes = affectedListItem.querySelectorAll(`.${constants.classes.listItem}`)
    const listItemNodes = [affectedListItem, ...affectedChildNodes]

    listItemNodes.forEach(listItemNode => {
      const checkbox = listItemNode.querySelector(`.${constants.classes.listItem} > .${constants.classes.subTitle} > .${constants.classes.checkbox}`)
      const { isAllSelected, isAnySelected } = dropdown.nodesMap.get(listItemNode.id)

      isAllSelected ? checkbox.classList.add(constants.classes.checkboxChecked) : checkbox.classList.remove(constants.classes.checkboxChecked)
      isAnySelected ? checkbox.classList.add(constants.classes.checkboxPartiallyChecked) : checkbox.classList.remove(constants.classes.checkboxPartiallyChecked)
    })

    let parentListItem = affectedListItem.parentElement.parentElement

    while (parentListItem.tagName === 'LI') {
      const checkbox = parentListItem.querySelector(`.${constants.classes.listItem} > .${constants.classes.subTitle} > .${constants.classes.checkbox}`)
      const { isAllSelected, isAnySelected } = dropdown.nodesMap.get(parentListItem.id)

      isAllSelected ? checkbox.classList.add(constants.classes.checkboxChecked) : checkbox.classList.remove(constants.classes.checkboxChecked)
      isAnySelected ? checkbox.classList.add(constants.classes.checkboxPartiallyChecked) : checkbox.classList.remove(constants.classes.checkboxPartiallyChecked)
      
      parentListItem = parentListItem.parentElement.parentElement
    }
  } else {
    dropdown.closeDropdown()
  }
}

const rootClickHandler = (clickedElement, dropdown) => {
  if (!dropdown.isExpanded) {
    dropdown.openDropdown()
  } else {
    dropdown.closeDropdown()
  }
}

const elementTypeClickHandlersMap = new Map([
  [enums.ElementTypes.SublistToggle, sublistToggleClickHandler],
  [enums.ElementTypes.LabelContainer, labelContainerClickHandler],
  [enums.ElementTypes.Root, rootClickHandler]
])

export default function (e, dropdown) {
  for (const clickedElement of e.path) {
    const clickHandler = elementTypeClickHandlersMap.get(clickedElement.dataset?.type)

    if (clickHandler) {
      clickHandler(clickedElement, dropdown)

      return
    }
  }

  dropdown.closeDropdown()
}

export { labelContainerClickHandler }

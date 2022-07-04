import constants from './constants.js'
import enums from './enums.js'

const sublistToggleClickHandler = (clickedElement) => {
  const affectedListItem = clickedElement.parentElement.parentElement
  affectedListItem.classList.toggle(constants.classes.listItemExpanded)
}

const labelContainerClickHandler = (clickedElement, dropdown) => {
  dropdown.selectValue(clickedElement.id)

  if (dropdown.isMultiple) {
    const affectedListItem = clickedElement.parentElement
    const affectedChildNodes = affectedListItem.querySelectorAll(`.${constants.classes.subTitle}`)
    affectedChildNodes.forEach(node => {
      const checkbox = node.querySelector(`.${constants.classes.subTitle} > .${constants.classes.checkbox}`)
      const { isAllSelected, isAnySelected } = dropdown.nodesMap.get(node.id)

      isAllSelected ? checkbox.classList.add(constants.classes.checkboxChecked) : checkbox.classList.remove(constants.classes.checkboxChecked)
      isAnySelected ? checkbox.classList.add(constants.classes.checkboxPartiallyChecked) : checkbox.classList.remove(constants.classes.checkboxPartiallyChecked)
    })

    let parentListItem = affectedListItem.parentElement.parentElement

    while (parentListItem.tagName === 'LI') {
      const subTitle = parentListItem.querySelector(`.${constants.classes.listItem} > .${constants.classes.subTitle}`)
      const checkbox = subTitle.querySelector(`.${constants.classes.subTitle} > .${constants.classes.checkbox}`)
      const { isAllSelected, isAnySelected } = dropdown.nodesMap.get(subTitle.id)

      isAllSelected ? checkbox.classList.add(constants.classes.checkboxChecked) : checkbox.classList.remove(constants.classes.checkboxChecked)
      isAnySelected ? checkbox.classList.add(constants.classes.checkboxPartiallyChecked) : checkbox.classList.remove(constants.classes.checkboxPartiallyChecked)
      
      parentListItem = parentListItem.parentElement.parentElement
    }
  } else {
    dropdown.closeDropdown()
  }
}

const rootClickHandler = (clickedElement, dropdown) => {
  dropdown.arrowElement.classList.toggle(constants.classes.headerArrowExpanded)

  if (!dropdown.isExpanded) {
    dropdown.isExpanded = true
    dropdown.emit(enums.EventNames.Open)
    const rootRect = clickedElement.getBoundingClientRect()
    const listStyle = dropdown.optionsListElement.style
    listStyle.display = 'block'
    listStyle.left = `${rootRect.left}px`
    listStyle.top = `${rootRect.bottom}px`
    listStyle.right = `${document.body.getBoundingClientRect().right - rootRect.right}px`
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

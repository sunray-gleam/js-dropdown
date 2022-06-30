import enums from './enums.js'

const sublistToggleClickHandler = (clickedElement) => {
  const affectedListItem = clickedElement.parentElement.parentElement
  affectedListItem.classList.toggle('dropdown__list-item--expanded')
}

const labelContainerClickHandler = (clickedElement, dropdown) => {
  dropdown.selectValue(clickedElement.id)

  if (dropdown.isMultiple) {
    const affectedListItem = clickedElement.parentElement
    const affectedChildNodes = affectedListItem.querySelectorAll('.dropdown__item-label-container')
    affectedChildNodes.forEach(node => {
      const checkbox = node.querySelector('.dropdown__item-label-container > .dropdown__checkbox')
      const { isAllSelected, isAnySelected } = dropdown.nodesMap.get(node.id)

      isAllSelected ? checkbox.classList.add('dropdown__checkbox--checked') : checkbox.classList.remove('dropdown__checkbox--checked')
      isAnySelected ? checkbox.classList.add('dropdown__checkbox--partially-checked') : checkbox.classList.remove('dropdown__checkbox--partially-checked')
    })

    let parentListItem = affectedListItem.parentElement.parentElement

    while (parentListItem.tagName === 'LI') {
      const subTitle = parentListItem.querySelector('.dropdown__list-item > .dropdown__item-label-container')
      const checkbox = subTitle.querySelector('.dropdown__item-label-container > .dropdown__checkbox')
      const { isAllSelected, isAnySelected } = dropdown.nodesMap.get(subTitle.id)

      isAllSelected ? checkbox.classList.add('dropdown__checkbox--checked') : checkbox.classList.remove('dropdown__checkbox--checked')
      isAnySelected ? checkbox.classList.add('dropdown__checkbox--partially-checked') : checkbox.classList.remove('dropdown__checkbox--partially-checked')
      
      parentListItem = parentListItem.parentElement.parentElement
    }
  } else {
    dropdown.closeDropdown()
  }
}

const rootClickHandler = (clickedElement, dropdown) => {
  dropdown.arrowElement.classList.toggle('dropdown__header-arrow--expanded')

  if (!dropdown.isExpanded) {
    dropdown.isExpanded = true
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

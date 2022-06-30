import enums from './enums.js'

const sublistToggleClickHandler = (clickedElement) => {
  const affectedListItem = clickedElement.parentElement.parentElement
  affectedListItem.classList.toggle('dropdown__list-item--expanded')
}

const labelContainerClickHandler = (clickedElement, dropdown) => {
  dropdown.selectValue(clickedElement.id)

  if (!dropdown.isMultiple) {
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
  // console.log(e.target)
  // if (this.optionsListElement.contains(e.target)) {
  //   const affectedNode = e.path.find(({ classList, tagName }) =>
  //     classList.contains(listItemClass) && tagName.toLowerCase() == listItemTag)

  //   this.selectValue(affectedNode.id)
  //   this.closeDropdown()
  // } else {
  //   if (!root.contains(e.target)) {
  //     this.closeDropdown()
  //   }
  // }
}

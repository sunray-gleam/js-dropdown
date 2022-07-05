import constants from './constants.js'
import { labelContainerClickHandler } from './clickHelper.js'

const rootEventHandler = (e, dropdown) => {
  if (e.code === 'Enter') {
    if (dropdown.isExpanded) {
      labelContainerClickHandler(dropdown.activeElement.querySelector(`.${constants.classes.listItem} > .${constants.classes.subTitle}`), dropdown)
    } else {
      dropdown.openDropdown()
    }
  }

  if (e.code === 'ArrowDown') {
    if (dropdown.isExpanded) {
      const activeElement = dropdown.activeElement

      if (activeElement.classList.contains(constants.classes.listItemExpanded)) {
        const newActiveElement = activeElement.querySelector(`.${constants.classes.listItem} > .${constants.classes.sublist} > .${constants.classes.listItem}`)
        dropdown.updateActiveElement(newActiveElement)

        return
      }

      const activeElementSibling = activeElement.nextElementSibling

      if (activeElementSibling) {
        dropdown.updateActiveElement(activeElementSibling)

        return
      }

      let activeElementParent = activeElement

      while (activeElementParent.nextElementSibling === null && activeElementParent.parentElement.parentElement.tagName === 'LI') {
        activeElementParent = activeElementParent.parentElement.parentElement
      }

      if (activeElementParent.nextElementSibling === null) {
        dropdown.updateActiveElement(activeElementParent.parentElement.firstElementChild)
      } else {
        dropdown.updateActiveElement(activeElementParent.nextElementSibling)
      }
    }
  }

  if (e.code === 'ArrowUp') {
    if (dropdown.isExpanded) {
      const activeElement = dropdown.activeElement
      const activeElementSibling = activeElement.previousElementSibling

      if (activeElementSibling) {
        let newActiveElement = activeElementSibling

        while (newActiveElement.classList.contains(constants.classes.listItemExpanded)) {
          const sublist = newActiveElement.querySelector(`.${constants.classes.listItem} > .${constants.classes.sublist}`)
          newActiveElement = sublist.lastChild
        }

        dropdown.updateActiveElement(newActiveElement)

        return
      }

      if (activeElement.parentElement.parentElement.tagName === 'LI') {
        dropdown.updateActiveElement(activeElement.parentElement.parentElement)
      } else {
        let newActiveElement = activeElement.parentElement.lastChild

        while (newActiveElement.classList.contains(constants.classes.listItemExpanded)) {
          const sublist = newActiveElement.querySelector(`.${constants.classes.listItem} > .${constants.classes.sublist}`)
          newActiveElement = sublist.lastChild
        }

        dropdown.updateActiveElement(newActiveElement)
      }
    }
  }

  if (e.code === 'ArrowRight') {
    const activeElement = dropdown.activeElement

    if (!activeElement.classList.contains(constants.classes.listItemExpanded) && activeElement.querySelector(`.${constants.classes.listItem} > .${constants.classes.sublist}`)) {
      activeElement.classList.add(constants.classes.listItemExpanded)
    }
  }

  if (e.code === 'ArrowLeft') {
    const classList = dropdown.activeElement.classList

    if (classList.contains(constants.classes.listItemExpanded)) {
      classList.remove(constants.classes.listItemExpanded)
    }
  }

  if (e.code === 'Escape') {
    dropdown.closeDropdown()
  }
}

const mouseMoveHandler = (e, dropdown) => {
  let currentElement = e.target

  while (currentElement.tagName !== 'BODY') {
    if (currentElement.tagName === 'LI') {
      dropdown.updateActiveElement(currentElement)

      return
    } else {
      currentElement = currentElement.parentElement
    }
  }
}

export { rootEventHandler, mouseMoveHandler }

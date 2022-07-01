import Dropdown from './component/index.js'

document.addEventListener('DOMContentLoaded', () => {
  const dropdown = new Dropdown({
    options: [
      {
        id: 1,
        value: 'Option 1'
      },
      {
        id: 2,
        value: 'Option 2'
      },
      {
        id: 3,
        value: 'Very Long Name of The Option 3'
      },
      {
        id: 4,
        value: 'sublist',
        children: [
          {
            id: 5,
            value: 'sublist-item-1'
          },
          {
            id: 6,
            value: 'sublist-item-2'
          }
        ]
      }
    ],
    id: 'id',
    value: 1,
    isMultiple: true,
  })

  const dropdownElement = document.getElementById('id')
  dropdownElement.addEventListener('close', (e) => console.log('close', e.detail))

  console.log(dropdown)
})

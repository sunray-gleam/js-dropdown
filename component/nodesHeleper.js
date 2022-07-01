import enums from './enums.js'

const dfs = (node, values, resultMap, parentNodeId = null) => {
  let nodeModel = null

  if (node.children?.length) {
    const nodeModels = node.children.map(child =>  dfs(child, values, resultMap, node.id))

    nodeModel = {
      id: node.id,
      isAnySelected: nodeModels.some(x => x.isAnySelected),
      isAllSelected: nodeModels.every(x => x.isAllSelected),
      children: node.children.map(x => x.id.toString()),
      parent: parentNodeId?.toString()
    }
  } else {
    const isSelected = values.includes(node.id)
    nodeModel = {
      id: node.id,
      isAllSelected: isSelected,
      isAnySelected: isSelected,
      parent: parentNodeId?.toString()
    }
  }

  resultMap.set(node.id.toString(), nodeModel)

  return nodeModel
}

const buildNodesMap = (options, value) => {
  const arrayValue = typeof(value) === Array
    ? value
    : [value]

  const result = new Map()

  for (const option of options) {
    dfs(option, arrayValue, result)
  }

  return result
}

const selectNode = (nodesMap, nodeId, selectType = enums.SelectTypes.Default) => {
  const node = nodesMap.get(nodeId)
  const computedSelectType = selectType === enums.SelectTypes.Default
    ? node.isAllSelected
      ? enums.SelectTypes.Deselect
      : enums.SelectTypes.Select
    : selectType
  const isSelect = computedSelectType === enums.SelectTypes.Select

  node.isAllSelected = isSelect
  node.isAnySelected = isSelect
  node.children?.forEach(x => selectNode(nodesMap, x, computedSelectType))
  updateParentSelectionStatus(nodesMap, node.parent, computedSelectType)
}

const updateParentSelectionStatus = (nodesMap, nodeId) => {
  if (!nodeId) {
    return
  }

  const node = nodesMap.get(nodeId)
  node.isAnySelected = node.children.some(childId => nodesMap.get(childId).isAnySelected)
  node.isAllSelected = node.children.every(childId => nodesMap.get(childId).isAllSelected)
}

const getSelectedValues = (nodesMap) => {
  const nodes = Array.from(nodesMap.values())

  return nodes
    .filter(x => !x.children && x.isAllSelected)
    .map(x => x.id)
}

export { buildNodesMap, selectNode, getSelectedValues }

const diffProperties = require("./diffProperties")
const fs = require("fs")

const {
  decryptSops
} = require("sops-wrapper")

const loadSopsFile = (path, differences) => {
  if (!fs.existsSync(path)) {
    differences.push({
      filePath: path,
      message: `File '${path}' does not exist`
    })

    return
  }

  try {
    return decryptSops(path)
  } catch (err) {
    differences.push({
      filePath: path,
      message: `Loading sops file from '${path}' has failed with: ${err}`
    })

    return
  }
}

module.exports = (leftFilePath, rightFilePath, ignoreList) => {
  const differences = []
  
  const left = loadSopsFile(leftFilePath, differences)
  const right = loadSopsFile(rightFilePath, differences)

  if (left && right) {
    diffProperties(left, right, ignoreList, differences)
  }

  differences.forEach(diff => {
    diff.message = diff.message
      .replace("$LEFT", leftFilePath)
      .replace("$RIGHT", rightFilePath)
  })

  return differences
}
const diffProperties = require("./diffProperties")

const fs = require("fs")
const yaml = require("js-yaml")

const loadYamlFile = (path, differences) => {
    if (!fs.existsSync(path)) {
        differences.push({
            filePath: path,
            message: `File '${path}' does not exist`
        })

        return
    }

    const content = fs.readFileSync(path)

    try {
        return yaml.load(content)
    } catch (err) {
        differences.push({
            filePath: path,
            message: `Loading yaml from '${path}' has failed with ${err}`
        })

        return
    }
}

module.exports = (leftFilePath, rightFilePath, ignoreList, differences = []) => {
    const left = loadYamlFile(leftFilePath, differences)   
    const right = loadYamlFile(rightFilePath, differences)

    if(left && right) {
        diffProperties(left, right, ignoreList, differences)
    }

    differences.forEach(diff => {
        diff.message = diff.message
            .replace("$LEFT", leftFilePath)
            .replace("$RIGHT", rightFilePath)
    })

    return differences
}
const diffFiles = require("./diffFiles")

const glob = require("glob")

module.exports = (leftDir, rightDir, fileNameGlob = "**/*", ignoreListFunc = undefined) => {
    const differences = []

    const leftDirFiles = glob.globSync(fileNameGlob, {
        cwd: leftDir
    })
    const rightDirFiles = glob.globSync(fileNameGlob, {
        cwd: rightDir
    })

    leftDirFiles.forEach(fileName => {
        const leftFilePath = `${leftDir}/${fileName}`
        const rightFilePath = `${rightDir}/${fileName}`

        let fileIgnoreList = []

        if (ignoreListFunc) {
            const ignoreResult = ignoreListFunc(fileName)

            if (typeof ignoreResult == "boolean" && ignoreResult) {
                return // Whole file is ignored
            }

            fileIgnoreList = ignoreResult
        }

        rightDirFiles.splice(rightDirFiles.indexOf(fileName), 1)

        diffFiles(leftFilePath, rightFilePath, fileIgnoreList, differences)
    })

    rightDirFiles.forEach(fileName => {
        const leftFilePath = `${leftDir}/${fileName}`
        const rightFilePath = `${rightDir}/${fileName}`

        // Diff files is used to avoid duplicating handling non existing files on one side
        diffFiles(leftFilePath, rightFilePath, [], differences)
    })

    return differences
}
const diffFiles = require("./diffFiles")
const diffSopsFiles = require("./diffSopsFiles")

const glob = require("glob")
const {
    minimatch
} = require("minimatch")

const defaultOptions = {
    fileNameGlob: "**/*",
    ignoreListFunc: undefined,
    sopsFilesGlob: undefined
}

module.exports = (leftDir, rightDir, options = defaultOptions) => {
    const context = new Context(leftDir, rightDir, options)

    context.leftDirFiles.forEach(fileName => {
        const leftFilePath = `${leftDir}/${fileName}`
        const rightFilePath = `${rightDir}/${fileName}`

        if (context.isFullyIgnored(fileName)) {
            context.removeRightDirFileIfExists(fileName)
            return // Whole file is ignored
        }

        const ignore = context.getIgnoreForFile(fileName)

        context.removeRightDirFile(fileName)

        const fileDifferences = context.isSops(fileName)
            ? diffSopsFiles(leftFilePath, rightFilePath, ignore)
            : diffFiles(leftFilePath, rightFilePath, ignore)

        context.appendDifferences(fileDifferences)
    })

    // Files which only exist on the right side
    context.rightDirFiles.forEach(fileName => {
        const leftFilePath = `${leftDir}/${fileName}`
        const rightFilePath = `${rightDir}/${fileName}`

        if (context.isFullyIgnored(fileName)) {
            return // Whole file is ignored
        }

        // Diff files is used just to avoid duplicating handling non existing files on one side
        context.appendDifferences(diffFiles(leftFilePath, rightFilePath))
    })

    return context.differences
}

class Context {
    constructor(leftDir, rightDir, options) {
        this.options = options
        this.differences = []
        
        this.leftDirFiles = this.globFiles(leftDir)
        this.rightDirFiles = this.globFiles(rightDir)
    }

    getIgnoreForFile(fileName) {
        if (this.options && this.options.ignoreListFunc) {
            return this.options.ignoreListFunc(fileName)
        }

        return []
    }

    isFullyIgnored(fileName) {
        const ignore = this.getIgnoreForFile(fileName)

        return typeof ignore === "boolean" && ignore
    }

    removeRightDirFile(fileName) {
        const index = this.rightDirFiles.indexOf(fileName)

        this.rightDirFiles.splice(index, 1)
    }

    removeRightDirFileIfExists(fileName) {
        const index = this.rightDirFiles.indexOf(fileName)

        if(index > -1) {
            this.rightDirFiles.splice(index, 1)
        }
    }

    globFiles(dirPath) {
        return glob.globSync(this.options.fileNameGlob, {
            cwd: dirPath
        })
    }

    isSops(fileName) {
        if(this.options && this.options.sopsFilesGlob) {
            return minimatch(fileName, this.options.sopsFilesGlob)
        }

        return false
    }

    appendDifferences(toAppend) {
        this.differences.push(...toAppend)
    }
}
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

class Context {
    constructor(leftDir, rightDir, options) {
        this.options = options
        this.differences = []
        
        this.leftDirFiles = this.globFiles(leftDir)
        this.rightDirFiles = this.globFiles(rightDir)
    }

    getIgnoreForFile(relativeFilePath) {
        if (this.options && this.options.ignoreListFunc) {
            return this.options.ignoreListFunc(relativeFilePath)
        }

        return []
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
}

module.exports = (leftDir, rightDir, options = defaultOptions) => {
    const context = new Context(leftDir, rightDir, options)

    context.leftDirFiles.forEach(fileName => {
        const leftFilePath = `${leftDir}/${fileName}`
        const rightFilePath = `${rightDir}/${fileName}`

        const ignore = context.getIgnoreForFile(fileName)

        if (typeof ignore == "boolean" && ignore) {
            context.removeRightDirFileIfExists(fileName)
            return // Whole file is ignored
        }

        context.removeRightDirFile(fileName)

        if(context.isSops(fileName)) {
            diffSopsFiles(leftFilePath, rightFilePath, ignore, context.differences)
        }
        else {
            diffFiles(leftFilePath, rightFilePath, ignore, context.differences)
        }
    })

    // Files which only exist on the right side
    context.rightDirFiles.forEach(fileName => {
        const leftFilePath = `${leftDir}/${fileName}`
        const rightFilePath = `${rightDir}/${fileName}`

        const ignore = context.getIgnoreForFile(fileName)

        if (typeof ignore == "boolean" && ignore) {
            return // Whole file is ignored
        }

        // Diff files is used just to avoid duplicating handling non existing files on one side
        diffFiles(leftFilePath, rightFilePath, [], context.differences)
    })

    return context.differences
}
const diffDirs = require("./diffDirs")

const fs = require("fs")
const glob = require("glob")
const sopsWrapper = require("sops-wrapper")

jest.mock("fs")
jest.mock("glob")
jest.mock("sops-wrapper")

describe("Dir diff should", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })

    test("Return empty list given dirs with files with the same structure", () => {
        // Arrange
        glob.globSync
            .mockReturnValueOnce([ "file1.yml", "file2.yml" ])
            .mockReturnValueOnce([ "file1.yml", "file2.yml" ])

        fs.existsSync
            .mockReturnValue(true)

        fs.readSync
            .mockReturnValue("hello: world")

        // Act
        const differences = diffDirs("./left", "./right")

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Return difference given left directory with extra file", () => {
        // Arrange
        glob.globSync
            .mockReturnValueOnce([ "file1.yml", "file2.yml" ])
            .mockReturnValueOnce([ "file1.yml" ])

        fs.existsSync
            .mockReturnValueOnce(true)  // left  file1.yml
            .mockReturnValueOnce(true)  // right file1.yml
            .mockReturnValueOnce(true)  // left  file2.yml
            .mockReturnValueOnce(false) // right file2.yml

        // Act
        const differences = diffDirs("./left", "./right")

        // Assert
        expect(differences[0].message).toBe("File './right/file2.yml' does not exist")
    })

    test("Return difference given right directory with extra file", () => {
        // Arrange
        glob.globSync
            .mockReturnValueOnce([ "file1.yml" ])
            .mockReturnValueOnce([ "file1.yml", "file2.yml" ])

        fs.existsSync
            .mockReturnValueOnce(true)  // left  file1.yml
            .mockReturnValueOnce(true)  // right file1.yml
            .mockReturnValueOnce(false) // left  file2.yml
            .mockReturnValueOnce(true)  // right file2.yml

        // Act
        const differences = diffDirs("./left", "./right")

        // Assert
        expect(differences[0].message).toBe("File './left/file2.yml' does not exist")
    })

    test("Return difference given files with different structures", () => {
        // Arrange
        glob.globSync
            .mockReturnValueOnce([ "file1.yml" ])
            .mockReturnValueOnce([ "file1.yml" ])

        fs.existsSync
            .mockReturnValue(true)

        fs.readFileSync
            .mockReturnValueOnce("hello: world")
            .mockReturnValueOnce("hello: world\nextra: prop")

        // Act
        const differences = diffDirs("./left", "./right")

        // Assert
        expect(differences[0].message).toBe("Property 'extra' is missing in './left/file1.yml'")
    })

    test("Return empty list given files with ignored differences", () => {
        // Arrange
        glob.globSync
            .mockReturnValueOnce([ "file1.yml" ])
            .mockReturnValueOnce([ "file1.yml" ])

        fs.existsSync
            .mockReturnValue(true)

        fs.readFileSync
            .mockReturnValueOnce("hello: world")
            .mockReturnValueOnce("hello: world\nextra: prop")

        const options = {
            ignoreListFunc: () => true
        }

        // Act
        const differences = diffDirs("./left", "./right", options)

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Return empty list given ignored file which exists only on the left side", () => {
        // Arrange
        glob.globSync
            .mockReturnValueOnce([ "file1.yml" ])
            .mockReturnValueOnce([])

        fs.existsSync
            .mockReturnValue(true)

        const options = {
            ignoreListFunc: () => true
        }

        // Act
        const differences = diffDirs("./left", "./right", options)

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Return empty list given ignored file which exists only on the right side", () => {
        // Arrange
        glob.globSync
            .mockReturnValueOnce([])
            .mockReturnValueOnce([ "file1.yml" ])

        fs.existsSync
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true)

        const options = {
            ignoreListFunc: () => true
        }

        // Act
        const differences = diffDirs("./left", "./right", options)

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Return empty list given SOPS encrypted files with same structures", () => {
        // Arrange
        glob.globSync
            .mockReturnValueOnce([ "file1.yml" ])
            .mockReturnValueOnce([ "file1.yml" ])

        fs.existsSync
            .mockReturnValue(true)

        sopsWrapper.decryptSops
            .mockReturnValueOnce("hello: world")
            .mockReturnValueOnce("hello: world")

        // Act
        const differences = diffDirs("./left", "./right")

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Return difference given SOPS encrypted files with different structures", () => {
        // Arrange
        glob.globSync
            .mockReturnValueOnce([ "file1.sops.yml" ])
            .mockReturnValueOnce([ "file1.sops.yml" ])

        fs.existsSync
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)

        sopsWrapper.decryptSops
            .mockReturnValueOnce({ hello: "world" })
            .mockReturnValueOnce({ hello: 5 })

        const options = {
            sopsFilesGlob: "**/*.sops.yml"
        }

        // Act
        const differences = diffDirs("./left", "./right", options)

        // Assert
        expect(differences[0].message).toBe("Values are of different types (string in './left/file1.sops.yml', number in './right/file1.sops.yml')")
    })
    
})
const diffDirs = require("./diffDirs")
const fs = require("fs")
const glob = require("glob")

jest.mock("fs")
jest.mock("glob")

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
})
const diffFiles = require("./diffFiles")
const fs = require("fs")

jest.mock("fs")

describe("File diff should", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })

    test("Return empty list of differences given files with same structure", () => {
        // Arrange
        fs.existsSync
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)

        fs.readFileSync
            .mockReturnValueOnce("hello: world")
            .mockReturnValueOnce("hello: universe1")

        // Act
        const differences = diffFiles("left.yml", "right.yml")

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Return difference given left file does not exist", () => {
        // Arrange
        fs.existsSync
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true)

        fs.readFileSync
            .mockReturnValueOnce("hello: universe2")
            .mockReturnValueOnce("hello: universe3")

        // Act
        const differences = diffFiles("left.yml", "right.yml")

        // Assert
        expect(differences[0].message).toBe("File 'left.yml' does not exist")
    })

    test("Return difference given left file does not exist", () => {
        // Arrange
        fs.existsSync
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false)

        fs.readFileSync
            .mockReturnValueOnce("hello: universe")
            .mockReturnValueOnce("hello: universe")

        // Act
        const differences = diffFiles("left.yml", "right.yml")

        // Assert
        expect(differences[0].message).toBe("File 'right.yml' does not exist")
    })

    test("Return difference given left file with invalid yaml", () => {
        // Arrange
        fs.existsSync
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)

        fs.readFileSync
            .mockReturnValueOnce("prop:\n    sub1: value\n sub2: value")
            .mockReturnValueOnce("hello: universe")

        // Act
        const differences = diffFiles("left.yml", "right.yml")

        // Assert
        expect(differences[0].message).toMatch(/^Loading yaml from 'left\.yml' has failed with.*/)
    })

    test("Return difference given right file with invalid yaml", () => {
        // Arrange
        fs.existsSync
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)

        fs.readFileSync
            .mockReturnValueOnce("hello: universe")
            .mockReturnValueOnce("prop:\n    sub1: value\n sub2: value")

        // Act
        const differences = diffFiles("left.yml", "right.yml")

        // Assert
        expect(differences[0].message).toMatch(/^Loading yaml from 'right\.yml' has failed with.*/)
    })

    test("Return difference given files with different structure", () => {
        // Arrange
        fs.existsSync
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)

        fs.readFileSync
            .mockReturnValueOnce("parent:\n  nested: true")
            .mockReturnValueOnce("parent:\n  nested: 123")

        // Act
        const differences = diffFiles("left.yml", "right.yml")

        // Assert
        expect(differences[0].message).toBe("Values are of different types (boolean in 'left.yml', number in 'right.yml')")
    })

    test("Return empty list given files with difference in ignored property", () => {
        // Arrange
        fs.existsSync
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)

        fs.readFileSync
            .mockReturnValueOnce("parent:\n  nested: true")
            .mockReturnValueOnce("parent:\n  nested: 123")

        const ignoreList = [
            "parent.nested"
        ]

        // Act
        const differences = diffFiles("left.yml", "right.yml", ignoreList)

        // Assert
        expect(differences).toHaveLength(0)
    })
})
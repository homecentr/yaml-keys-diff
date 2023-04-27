const diffSopsFiles = require("./diffSopsFiles")

const fs = require("fs")
const sopsWrapper = require("sops-wrapper")

jest.mock("fs")
jest.mock("sops-wrapper")

describe("SOPS File diff should", () => {
  test("Return empty list given files with difference in values", () => {
    // Arrange
    fs.existsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)

      sopsWrapper.decryptSops
      .mockReturnValueOnce({
        hello: "world"
      })
      .mockReturnValueOnce({
        hello: "welt"
      })

    // Act
    const differences = diffSopsFiles("left.yml", "right.yml")

    // Assert
    expect(differences).toHaveLength(0)
  })

  test("Return difference given files with different structures", () => {
    // Arrange
    fs.existsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)

    sopsWrapper.decryptSops
      .mockReturnValueOnce({
        hello: "world"
      })
      .mockReturnValueOnce({
        hello: 5
      })

    // Act
    const differences = diffSopsFiles("left.yml", "right.yml")

    // Assert
    expect(differences[0].message).toBe("Values are of different types (string in 'left.yml', number in 'right.yml')")
  })

  test("Return difference given left file does not exist", () => {
    // Arrange
    fs.existsSync
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)

    // Act
    const differences = diffSopsFiles("left.yml", "right.yml")

    // Assert
    expect(differences[0].message).toBe("File 'left.yml' does not exist")
  })

  test("Return difference given right file does not exist", () => {
    // Arrange
    fs.existsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)

    // Act
    const differences = diffSopsFiles("left.yml", "right.yml")

    // Assert
    expect(differences[0].message).toBe("File 'right.yml' does not exist")
  })

  test("Return difference given left file cannot be decrypted", () => {
    // Arrange
    fs.existsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)

    sopsWrapper.decryptSops
      .mockImplementationOnce(() => {
        throw new Error("some-error")
      })

    // Act
    const differences = diffSopsFiles("left.yml", "right.yml")

    // Assert
    expect(differences[0].message).toBe("Loading sops file from 'left\.yml' has failed with: Error: some-error")
  })

  test("Return difference given right file cannot be decrypted", () => {
    // Arrange
    fs.existsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)

    sopsWrapper.decryptSops
      .mockImplementationOnce(() => {
        return {
          hello: "world"
        }
      })
      .mockImplementationOnce(() => {
        throw new Error("some-error")
      })

    // Act
    const differences = diffSopsFiles("left.yml", "right.yml")

    // Assert
    expect(differences[0].message).toBe("Loading sops file from 'right\.yml' has failed with: Error: some-error")
  })
})
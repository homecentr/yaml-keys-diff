const diffProperties = require("./diffProperties")

describe("Properties diff should", () => {
    test("Return empty list of differences given objects with same properties", () => {
        // Arrange
        const obj1 = { prop: "value" }
        const obj2 = { prop: "value" }

        // Act
        const differences = diffProperties(obj1, obj2)

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Return empty list of differences given objects with different values of array property", () => {
        // Arrange
        const obj1 = { prop: [] }
        const obj2 = { prop: [ "value" ] }

        // Act
        const differences = diffProperties(obj1, obj2)

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Return difference given objects with different value types", () => {
        // Arrange
        const obj1 = { prop: true }
        const obj2 = { prop: "value" }

        // Act
        const differences = diffProperties(obj1, obj2)

        // Assert
        expect(differences[0].propertyPath).toBe("prop")
        expect(differences[0].message).toBe("Values are of different types (boolean in '$LEFT', string in '$RIGHT')")
    })

    test("Return difference given first object with missing property on right side", () => {
        // Arrange
        const obj1 = { prop: true, extra: "value" }
        const obj2 = { prop: true }

        // Act
        const differences = diffProperties(obj1, obj2)

        // Assert
        expect(differences[0].propertyPath).toBe("extra")
        expect(differences[0].message).toBe("Property 'extra' is missing in '$RIGHT'")
    })

    test("Return difference given second object with missing property on left side", () => {
        // Arrange
        const obj1 = { prop: true }
        const obj2 = { prop: true, extra: "value" }

        // Act
        const differences = diffProperties(obj1, obj2)

        // Assert
        expect(differences[0].propertyPath).toBe("extra")
        expect(differences[0].message).toBe("Property 'extra' is missing in '$LEFT'")
    })

    test("Return difference given first object with nested property missing on right side", () => {
        // Arrange
        const obj1 = { prop: true, parent: { extra: "value" } }
        const obj2 = { prop: true, parent: {} }

        // Act
        const differences = diffProperties(obj1, obj2)

        // Assert
        expect(differences[0].propertyPath).toBe("parent.extra")
        expect(differences[0].message).toBe("Property 'parent.extra' is missing in '$RIGHT'")
    })

    test("Return difference given second object with nested property missing on left side", () => {
        // Arrange
        const obj1 = { prop: true, parent: {} }
        const obj2 = { prop: true, parent: { extra: "value" } }

        // Act
        const differences = diffProperties(obj1, obj2)

        // Assert
        expect(differences[0].propertyPath).toBe("parent.extra")
        expect(differences[0].message).toBe("Property 'parent.extra' is missing in '$LEFT'")
    })

    test("Return empty list of differences given objects with difference in ignored property", () => {
        // Arrange
        const obj1 = { prop: true, parent: { extra: 123 } }
        const obj2 = { prop: true, parent: { extra: "value" } }

        const ignoreList = [
            "parent.extra"
        ]

        // Act
        const differences = diffProperties(obj1, obj2, ignoreList)

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Return empty list of differences given objects with extra ignored property", () => {
        // Arrange
        const obj1 = { prop: true, parent: {} }
        const obj2 = { prop: true, parent: { extra: "value" } }

        const ignoreList = [
            "parent.extra"
        ]

        // Act
        const differences = diffProperties(obj1, obj2, ignoreList)

        // Assert
        expect(differences).toHaveLength(0)
    })

    test("Throw undefined left object", () => {
        // Arrange
        const right = { prop: true, parent: { extra: "value" } }

        // Act & Assert
        expect(() => diffProperties(undefined, right)).toThrow("Cannot compare against undefined/null value.")
    })

    test("Throw undefined right object", () => {
        // Arrange
        const left = { prop: true, parent: { extra: "value" } }

        // Act & Assert
        expect(() => diffProperties(left, undefined)).toThrow("Cannot compare against undefined/null value.")
    })
})
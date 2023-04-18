const getPropPath = (path, propName) => {
    if (path && path !== "") {
        return `${path}.${propName}`
    }

    return propName
}

const diffObjectsRecursively = (left, right, ignoreList, differences, parentPath) => {
    const rightProps = Object.keys(right)

    Object.keys(left).forEach(propName => {
        const propPath = getPropPath(parentPath, propName)

        if (ignoreList.includes(propPath)) {
            return;
        }

        if (!Object.hasOwn(right, propName)) {
            differences.push({
                propertyPath: propPath,
                message: `Property '${propPath}' is missing in '$RIGHT'`
            })
        }

        rightProps.splice(rightProps.indexOf(propName), 1)

        const leftValue = left[propName]
        const rightValue = right[propName]

        if (typeof leftValue !== typeof rightValue) {
            differences.push({
                propertyPath: propPath,
                message: `Values are of different types (${typeof leftValue} in '$LEFT', ${typeof rightValue} in '$RIGHT')`
            })
        }

        if (Array.isArray(leftValue)) {
            return; // Arrays are not compared by design
        }

        if (typeof leftValue === "object") {
            diffObjectsRecursively(leftValue, rightValue, ignoreList, differences, propPath)
        }
    })

    rightProps.forEach(propName => {
        const propPath = getPropPath(parentPath, propName)

        if (ignoreList.includes(propPath)) {
            return;
        }

        differences.push({
            propertyPath: propPath,
            message: `Property '${propPath}' is missing in '$LEFT'`
        })
    })
}

module.exports = (obj1, obj2, ignoreList = [], differences = []) => {
    if (!obj1 || !obj2) {
        throw new Error("Cannot compare against undefined/null value.")
    }

    diffObjectsRecursively(obj1, obj2, ignoreList, differences, "")

    return differences
}
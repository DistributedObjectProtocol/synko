import { isFunction } from './is'
import { getUniqueKey } from './get'

export default function djsonFactory() {
    const types = {}
    const keys = []

    function stringifyRecursive(value, prop, object, index = 0) {
        const key = keys[index]
        const type = types[key]

        // if (!types.hasOwnProperty(key)) {
        if (index >= keys.length) {
            return value
        }

        if (type.isValidToStringify(value, prop, object)) {
            value = type.stringify(value, prop, object)
            return value
        }

        return stringifyRecursive(value, prop, object, index + 1)
    }

    function parseRecursive(value, prop, object, index = 0) {
        const key = keys[index]
        const type = types[key]

        if (index >= keys.length) {
            return value
        }

        if (type.isValidToParse(value, prop, object)) {
            value = type.parse(value, prop, object)
            return value
        }

        return parseRecursive(value, prop, object, index + 1)
    }

    function stringify(object, replacer, space) {
        runFunctionIfExists('beforeStringify', object)

        const stringified = JSON.stringify(
            object,
            function(prop, value) {
                value = stringifyRecursive(value, prop, this)
                return isFunction(replacer)
                    ? replacer.call(this, prop, value)
                    : value
            },
            space
        )

        runFunctionIfExists('afterStringify', object, stringified)
        return stringified
    }

    function parse(text, reviver) {
        runFunctionIfExists('beforeParse', text)

        const parsed = JSON.parse(text, function(prop, value) {
            value = parseRecursive(value, prop, this)
            return isFunction(reviver) ? reviver.call(this, prop, value) : value
        })

        runFunctionIfExists('afterParse', text, parsed)
        return parsed
    }

    function addType(factory) {
        const type = factory({ types, getUniqueKey })
        if (types.hasOwnProperty(type.key))
            throw type.key + ' already added as type'
        types[type.key] = type
        keys.push(type.key)
        return type
    }

    function runFunctionIfExists(name, ...args) {
        keys.forEach(key => {
            if (isFunction(types[key][name])) {
                types[key][name](...args)
            }
        })
    }

    return { stringify, parse, addType }
}

// function isValidToStringify(value, prop, object) {
//     for (const key in types) {
//         const isValid = types[key].isValidToStringify
//         if (isFunction(isValid) && isValid(value, prop, object)) {
//             return key
//         }
//     }
// }

// function isValidToParse(value, prop, object) {
//     if (!isPojoObject(value)) {
//         return
//     }
//     let key_name
//     for (const key in value) {
//         if (!types.hasOwnProperty(key) || key_name !== undefined) {
//             return
//         }
//         key_name = key
//     }
//     const isValid = types[key_name].isValidToParse
//     return isFunction(isValid) && isValid(value, prop, object)
//         ? key_name
//         : undefined
// }

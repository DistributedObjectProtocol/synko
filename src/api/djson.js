import { isPojoObject, isFunction } from '../util/is'

const TYPES = {
    $delete: {
        isValidToStringify: value => value === undefined,
        isValidToParse: value => value.$delete === 0,
        stringify: value => ({ $delete: 0 })
        // parse: value => value
    }
}

function isValidToStringify(value, prop, object) {
    for (const type_name in TYPES) {
        if (TYPES[type_name].isValidToStringify(value, prop, object)) {
            return type_name
        }
    }
}

function isValidToParse(value, prop, object) {
    if (!isPojoObject(value)) {
        return
    }
    let type_name
    for (const key in value) {
        if (!TYPES.hasOwnProperty(key) || type_name !== undefined) {
            return
        }
        type_name = key
    }
    return TYPES[type_name].isValidToParse(value, prop, object)
        ? type_name
        : undefined
}

function stringify(object, replacer, space) {
    const escaped = new Map()
    return JSON.stringify(
        object,
        function(prop, value) {
            if (value !== object && !escaped.has(value)) {
                if (isValidToParse(value, prop, this) !== undefined) {
                    escaped.set(value, true)
                    value = { $escape: value }
                }
                const type_name = isValidToStringify(value, prop, this)
                if (type_name !== undefined) {
                    value = TYPES[type_name].stringify(value, prop, this)
                }
            }

            return isFunction(replacer)
                ? replacer.call(this, prop, value)
                : value
        },
        space
    )
}

// function parse(text, reviver) {
//     return JSON.parse(text, function(prop, value) {
//         const type_name = isValidToParse(value)
//         if (type_name !== undefined) {
//             value = TYPES[type_name].parse(value[type_name])
//         }
//         return isFunction(reviver) ? reviver.call(this, prop, value) : value
//     })
// }

const DJSON = { stringify, TYPES }

export default DJSON

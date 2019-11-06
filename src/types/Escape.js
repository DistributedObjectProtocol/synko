export default function factoryDelete({ isValidToParse }) {
    const key = '$escape'
    let escaped

    // Constructor/Creator
    function Escape() {}

    Escape.key = key

    Escape.isValidToStringify = function(value, prop, object) {
        if (!escaped.has(value)) {
            const type_name = isValidToParse(value, prop, object)
            if (type_name !== undefined) {
                escaped.set(value, true)
                return true
            }
        }
        return false
    }

    Escape.stringify = function(value) {
        return { [key]: value }
    }

    Escape.isValidToParse = function() {
        return true
    }

    Escape.parse = function(value) {
        return value[key]
    }

    Escape.beforeStringify = function() {
        escaped = new Map()
    }

    return Escape
}

// DJSON.setType(Escape.key, ({ isValidToParse }) => {
//     let escaped
//     return {
//         isValidToStringify: (value, prop, object) => {
//             if (!escaped.has(value)) {
//                 const type_name = isValidToParse(value, prop, object)
//                 if (type_name !== undefined) {
//                     escaped.set(value, true)
//                     return true
//                 }
//             }
//             return false
//         },
//         isValidToParse: () => true,
//         stringify: value => ({ [escape]: value }),
//         parse: value => value[escape],
//         beforeStringify: () => (escaped = new Map())
//     }
// })

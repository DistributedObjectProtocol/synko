import { createPatchFromMutations } from '../util/set'

export default function createStoreFactory(applyPatchFunction) {
    return function createStore(state) {
        const listeners = new Map()

        function getState() {
            const { object } = applyPatchFunction({}, state)
            return object
        }

        function subscribe(listener, filter) {
            return listeners.set(listener, filter)
        }

        function unsubscribe(listener) {
            return listeners.delete(listener)
        }

        function applyPatch(patch) {
            const returns = []
            const { mutations } = applyPatchFunction(state, patch)
            listeners.forEach((filter, listener) => {
                const mutations_filtered =
                    typeof filter == 'function'
                        ? mutations.filter(filter)
                        : mutations

                if (mutations_filtered.length > 0) {
                    const { patch, unpatch } = createPatchFromMutations(
                        mutations_filtered
                    )
                    returns.push({
                        listener,
                        patch,
                        unpatch,
                        mutations: mutations_filtered
                    })
                }
            })
            return returns
        }

        return {
            state,
            listeners,
            getState,
            subscribe,
            applyPatch,
            unsubscribe
        }
    }
}

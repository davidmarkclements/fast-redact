'use strict'

function pathToKey (path) {
  return path.join('.')
}

/**
 * Creates a stash that should act as a global
 * registry of property values - used to store
 * and restore them on the target object.
 *
 * The stash is global in the sense that each
 * value is stored under its full path on the
 * target object.
 *
 * Note:
 * Only the first value stored for any given
 * path is retained - all others are ignored -
 * to guarantee the original values get not
 * overwritten by redacted ones when a specific
 * property matches mutiple `paths`.
 *
 * @returns a new stash
 */
function createStash () {
  const map = new Map()
  return {
    getValue (path) {
      const key = pathToKey(path)
      return map.get(key)
    },
    putValue (path, value) {
      const key = pathToKey(path)
      if (!map.has(key)) {
        map.set(key, value)
      }
    }
  }
}

module.exports = createStash

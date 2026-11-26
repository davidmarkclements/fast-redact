'use strict'

const rx = require('./rx')

module.exports = parse

function parse ({ paths }) {
  const wildcards = []
  var wcLen = 0
  const secret = paths.reduce(function (o, strPath, ix) {
    var path = strPath.match(rx).map((p) => p.replace(/'|"|`/g, ''))
    const leadingBracket = strPath[0] === '['
    path = path.map((p) => {
      if (p[0] === '[') return p.substr(1, p.length - 2)
      else return p
    })
    const star = path.indexOf('*')
    if (star > -1) {
      const before = path.slice(0, star)
      const beforeStr = before.join('.')
      const after = path.slice(star + 1, path.length)
      const nested = after.length > 0
      wcLen++
      wildcards.push({
        before,
        beforeStr,
        after,
        nested
      })
    } else {
      o[strPath] = {
        path: path,
        val: undefined,
        precensored: false,
        circle: '',
        escPath: JSON.stringify(strPath),
        leadingBracket: leadingBracket
      }
    }
    return o
  }, {})

  return { wildcards: sortWildcards(wildcards), wcLen, secret }
}

/**
 * Flat (non-nested) wildcard redactions must run before nested ones. A flat
 * path such as `a[*]` censors a whole subtree, so any nested path under the
 * same prefix is a no-op once it has run. More importantly, `groupRedact`
 * captures the values it replaces so that `restore` can roll them back: if a
 * nested redaction has already mutated those values, the captured copies are
 * already censored and `restore` cannot recover the originals.
 *
 * The sort is stable, so the relative order within each group is preserved.
 *
 * @param {Wildcard[]} wildcards
 * @returns {Wildcard[]}
 */
function sortWildcards (wildcards) {
  return wildcards.sort((a, b) => {
    if (a.nested === b.nested) return 0
    return a.nested ? 1 : -1
  })
}

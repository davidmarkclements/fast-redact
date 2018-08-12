'use strict'

const { groupRestore, nestedRestore } = require('./modifiers')

module.exports = restorer

function restorer ({secret, wcLen}) {
  return function compileRestore () {
    if (this.restore) return
    const paths = Object.keys(secret)
      .filter((path) => secret[path].precensored === false)
    const resetters = resetTmpl(secret, paths)
    const hasWildcards = wcLen > 0
    const state = hasWildcards ? {secret, groupRestore, nestedRestore} : {secret}
    /* eslint-disable-next-line */
    this.restore = Function(
      'o',
      restoreTmpl(resetters, paths, hasWildcards)
    ).bind(state)
  }
}

function resetTmpl (secret, paths) {
  return paths.map((path) => {
    const { circle, escPath, leadingBracket } = secret[path]
    const delim = leadingBracket ? '' : '.'
    const reset = circle
      ? `o.${circle} = secret[${escPath}].val`
      : `o${delim}${path} = secret[${escPath}].val`
    const clear = `secret[${escPath}].val = null`
    return `
      try { ${reset} } catch (e) {}
      ${clear}
    `
  }).join('')
}

function restoreTmpl (resetters, paths, hasWildcards) {
  const dynamicReset = hasWildcards === true ? `
    const keys = Object.keys(secret)
    const len = keys.length
    for (var i = ${paths.length}; i < len; i++) {
      const k = keys[i]
      const o = secret[k]
      if (o.flat === true) this.groupRestore(o)
      else this.nestedRestore(o)
      secret[k] = null
    }
  ` : ''

  return `
    const secret = this.secret
    ${resetters}
    ${dynamicReset}
    return o
  `
}

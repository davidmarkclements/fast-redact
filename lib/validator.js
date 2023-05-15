'use strict'

module.exports = validator

function validator (opts = {}) {
  const {
    ERR_PATHS_MUST_BE_STRINGS = () => 'fast-redact - Paths must be (non-empty) strings',
    ERR_INVALID_PATH = (s) => `fast-redact – Invalid path (${s})`
  } = opts

  return function validate ({ paths }) {
    const proxy = new Proxy({}, { get: () => proxy, set: () => { throw Error() } })
    const exprsToCheck = paths.map((s, i) => {
      if (typeof s !== 'string') {
        throw Error(ERR_PATHS_MUST_BE_STRINGS())
      }
      try {
        if (/〇/.test(s)) throw Error()
        const expr = (s[0] === '[' ? '' : '.') + s.replace(/^\*/, '〇').replace(/\.\*/g, '.〇').replace(/\[\*\]/g, '[〇]')
        if (/\n|\r|;/.test(expr)) throw Error()
        if (/\/\*/.test(expr)) throw Error()

        return `
        context.〇〇 = \`${s.replace(/`/g, '\\`')}\`
        o${expr}
        if ([o${expr}].length !== 1) return;
        `
      } catch (e) {
        throw Error(ERR_INVALID_PATH(s))
      }
    })

    const o = new Proxy({}, { get: () => o, set: () => { throw Error() } })
    const context = { 〇〇: paths[0] }

    try {
      /* eslint-disable-next-line */
      Function('〇', 'o', 'context', `
        'use strict'

        ${exprsToCheck.join('\n')}

        context.〇〇 = null;
      `)(null, o, context)

      if (context.〇〇 !== null) { throw Error(ERR_INVALID_PATH(context.〇〇)) }
    } catch (e) {
      throw Error(ERR_INVALID_PATH(context.〇〇))
    }
  }
}

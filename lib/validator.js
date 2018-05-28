'use strict'

const { Script } = require('vm')

module.exports = validator

function validator (opts = {}) {
  const {
    ERR_CENSOR_MUST_BE_FUNCTION = () => 'fast-redact – censor may not be a function',
    ERR_PATHS_MUST_BE_STRINGS = () => 'fast-redact - Paths must be strings',
    ERR_INVALID_PATH = (s) => `fast-redact – Invalid path (${s})`
  } = opts

  return function validate ({paths, serialize, censor}) {
    if (typeof censor === 'function') {
      throw Error(ERR_CENSOR_MUST_BE_FUNCTION())
    }
    paths.forEach((s) => {
      if (typeof s !== 'string') {
        throw Error(ERR_PATHS_MUST_BE_STRINGS())
      }
      try {
        if (/〇/.test(s)) throw Error()
        const proxy = new Proxy({}, {get: () => proxy, set: () => { throw Error() }})
        const expr = s.replace(/^\*/, '〇').replace(/\.\*/g, '.〇').replace(/\[\*\]/g, '[〇]')
        if (/\/\*/.test(expr)) throw Error()
        /* eslint-disable-next-line */
        new Script(`
          o.${expr}
          if ([o.${expr}].length !== 1) throw Error()
        `).runInNewContext({o: proxy, 〇: null})
      } catch (e) {
        throw Error(ERR_INVALID_PATH(s))
      }
    })
  }
}

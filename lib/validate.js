'use strict'

module.exports = validate

function validate ({paths, serialize, censor}) {
  if (typeof censor === 'function') {
    throw Error('fast-redact – censor may not be a function')
  }
  paths.forEach((s) => {
    if (typeof s !== 'string') {
      throw Error('fast-redact - Paths must be strings')
    }
    try {
      if (/〇/.test(s)) throw Error()
      const proxy = new Proxy({}, {get: () => proxy})
      const expr = s.replace(/\.\*/g, '.〇').replace(/\[\*\]/g, '[〇]')
      /* eslint-disable-next-line */
      Function('o', '〇', `o.${expr}`)(proxy)
    } catch (e) {
      throw Error(`fast-redact – Invalid path (${s})`)
    }
  })
}

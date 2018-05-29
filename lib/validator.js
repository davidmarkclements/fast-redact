'use strict'

const { createContext, runInContext } = require('vm')

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
        if (/\n|;/.test(expr)) throw Error()
        if (/\/\*/.test(expr)) throw Error()
        runInContext(`
          (function (
            Array, ArrayBuffer, Atomics, Boolean, DataView, Date,
            Error, EvalError, Float32Array, Float64Array, Function,
            Int16Array, Int32Array, Int8Array, Intl, JSON, Map,
            Math, Number, Object, Promise, Proxy, RangeError,
            ReferenceError, Reflect, RegExp, Set, SharedArrayBuffer,
            String, Symbol, SyntaxError, TypeError, URIError,
            Uint16Array, Uint32Array, Uint8Array, Uint8ClampedArray,
            WeakMap, WeakSet, WebAssembly, decodeURI,
            decodeURIComponent, encodeURI, encodeURIComponent, escape,
            isFinite, isNaN, parseFloat, parseInt, unescape
          ) {
            'use strict'
            arguments.constructor = null
            o.${expr}
            if ([o.${expr}].length !== 1) throw {}
          })()
        `, createContext({o: proxy, 〇: null}), {
          codeGeneration: {strings: false, wasm: false}
        })
      } catch (e) {
        throw Error(ERR_INVALID_PATH(s))
      }
    })
  }
}

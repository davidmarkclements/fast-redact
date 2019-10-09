'use strict'
const bench = require('fastbench')
const noir = require('pino-noir')(['a.b.c'])
const fastRedact = require('..')

const censorFn = (v) => v + '.'
const censorFnWithPath = (v, p) => v + '.'

const redactNoSerialize = fastRedact({ paths: ['a.b.c'], serialize: false })
const redactWildNoSerialize = fastRedact({ paths: ['a.b.*'], serialize: false })
const redactIntermediateWildNoSerialize = fastRedact({ paths: ['a.*.c'], serialize: false })
const redact = fastRedact({ paths: ['a.b.c'] })
const noirWild = require('pino-noir')(['a.b.*'])
const redactWild = fastRedact({ paths: ['a.b.*'] })
const redactIntermediateWild = fastRedact({ paths: ['a.*.c'] })
const redactIntermediateWildMatchWildOutcome = fastRedact({ paths: ['a.*.c', 'a.*.b', 'a.*.a'] })
const redactStaticMatchWildOutcome = fastRedact({ paths: ['a.b.c', 'a.d.a', 'a.d.b', 'a.d.c'] })
const noirCensorFunction = require('pino-noir')(['a.b.*'], censorFn)
const redactCensorFunction = fastRedact({ paths: ['a.b.*'], censor: censorFn, serialize: false })
const redactIntermediateWildCensorFunction = fastRedact({ paths: ['a.*.c'], censor: censorFn, serialize: false })
const redactCensorFunctionWithPath = fastRedact({ paths: ['a.d.b'], censor: censorFn, serialize: false })
const redactWildCensorFunctionWithPath = fastRedact({ paths: ['a.d.*'], censor: censorFnWithPath, serialize: false })
const redactIntermediateWildCensorFunctionWithPath = fastRedact({ paths: ['a.*.c'], censorFnWithPath, serialize: false })

const getObj = () => ({
  a: {
    b: {
      c: 's'
    },
    d: {
      a: 's',
      b: 's',
      c: 's'
    }
  }
})

const max = 500

var run = bench([
  function benchNoirV2 (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      noir.a(obj.a)
    }
    setImmediate(cb)
  },
  function benchFastRedact (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactNoSerialize(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactRestore (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactNoSerialize(obj)
      redactNoSerialize.restore(obj)
    }
    setImmediate(cb)
  },
  function benchNoirV2Wild (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      noirWild.a(obj.a)
    }
    setImmediate(cb)
  },
  function benchFastRedactWild (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactWildNoSerialize(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactWildRestore (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactWildNoSerialize(obj)
      redactWildNoSerialize.restore(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactIntermediateWild (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactIntermediateWildNoSerialize(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactIntermediateWildRestore (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactIntermediateWildNoSerialize(obj)
      redactIntermediateWildNoSerialize.restore(obj)
    }
    setImmediate(cb)
  },
  function benchJSONStringify (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      JSON.stringify(obj)
    }
    setImmediate(cb)
  },
  function benchNoirV2Serialize (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      noir.a(obj.a)
      JSON.stringify(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactSerialize (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redact(obj)
    }
    setImmediate(cb)
  },
  function benchNoirV2WildSerialize (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      noirWild.a(obj.a)
      JSON.stringify(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactWildSerialize (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactWild(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactIntermediateWildSerialize (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactIntermediateWild(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactIntermediateWildMatchWildOutcomeSerialize (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactIntermediateWildMatchWildOutcome(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactStaticMatchWildOutcomeSerialize (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactStaticMatchWildOutcome(obj)
    }
    setImmediate(cb)
  },
  function benchNoirV2CensorFunction (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      noirCensorFunction.a(obj.a)
    }
    setImmediate(cb)
  },
  function benchFastRedactCensorFunction (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactCensorFunction(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactCensorFunctionIntermediateWild (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactIntermediateWildCensorFunction(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactCensorFunctionWithPath (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactCensorFunctionWithPath(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactWildCensorFunctionWithPath (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactWildCensorFunctionWithPath(obj)
    }
    setImmediate(cb)
  },
  function benchFastRedactIntermediateWildCensorFunctionWithPath (cb) {
    const obj = getObj()
    for (var i = 0; i < max; i++) {
      redactIntermediateWildCensorFunctionWithPath(obj)
    }
    setImmediate(cb)
  }
], 500)

run(run)

'use strict'

const validate = require('./lib/validate')
const parse = require('./lib/parse')
const redactor = require('./lib/redactor')
const restorer = require('./lib/restorer')
const { groupRedact, nestedRedact } = require('./lib/modifiers')
const state = require('./lib/state')

const DEFAULT_CENSOR = '[REDACTED]'

module.exports = fastRedact

function fastRedact (opts = {}) {
  const paths = Array.from(new Set(opts.paths || []))
  const serialize = 'serialize' in opts ? opts.serialize : JSON.stringify
  const censor = 'censor' in opts ? opts.censor : DEFAULT_CENSOR

  if (paths.length === 0) {
    if (serialize === false) {
      const wrapper = (o) => o
      wrapper.restore = wrapper
      return wrapper
    } else return serialize
  }

  validate({paths, serialize, censor})

  const { wildcards, wcLen, secret } =  parse({paths, censor})

  const compileRestore = restorer({secret, wcLen})  

  return redactor({secret, wcLen, serialize}, state({
    secret,
    censor,
    compileRestore,
    serialize,
    groupRedact,
    nestedRedact,
    wildcards,
    wcLen
  }))
}


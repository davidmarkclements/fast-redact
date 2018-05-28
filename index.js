'use strict'

const validator = require('./lib/validator')
const parse = require('./lib/parse')
const redactor = require('./lib/redactor')
const restorer = require('./lib/restorer')
const { groupRedact, nestedRedact } = require('./lib/modifiers')
const state = require('./lib/state')
const rx = require('./lib/rx')
const validate = validator()
const noop = (o) => o
noop.restore = noop

const DEFAULT_CENSOR = '[REDACTED]'
fastRedact.rx = rx
fastRedact.validator = validator

module.exports = fastRedact

function fastRedact (opts = {}) {
  const paths = Array.from(new Set(opts.paths || []))
  const serialize = 'serialize' in opts ? (
    opts.serialize === false ? opts.serialize :
      (typeof opts.serialize === 'function' ? opts.serialize : JSON.stringify) 
  ) : JSON.stringify
  const censor = 'censor' in opts ? opts.censor : DEFAULT_CENSOR

  if (paths.length === 0) return serialize || noop

  validate({paths, serialize, censor})

  const { wildcards, wcLen, secret } = parse({paths, censor})

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

'use strict'

const rx = require('./rx')

module.exports = redactor 

function redactor (args, state) {
  const redact = create(args).bind(state)
  if (args.serialize === false) {
    redact.restore = (o) => state.restore(o)
  }
  return redact
}

function create ({secret, serialize, wcLen}) {
  const dynamicRedact = `
    {
      const { wildcards, wcLen, groupRedact, nestedRedact } = this
      for (var i = 0; i < wcLen; i++) {
        const { before, beforeStr, after, nested } = wildcards[i]
        if (nested === true) {
          secret[beforeStr] = secret[beforeStr] || []
          nestedRedact(secret[beforeStr], o, before, after, censor)
        } else secret[beforeStr] = groupRedact(o, before, censor)
      }
    }
  `

  const staticPaths = Object.keys(secret)
  const topCheck = `
    if (typeof o !== 'object' || o == null) {
      throw Error('fast-redact: primitives cannot be redacted')
    }
  `
  const returnResult = serialize === false ? `return o` : `
    var s = this.serialize(o)
    this.restore(o)
    return s
  `
  const str = topCheck + '\nconst { censor, secret } = this\n' + staticPaths.map((path) => {
      const pArr = secret[path].path
      const escPath = secret[path].escPath
      const last = pArr.length - 1
      
      const hops = []
      var match
      while ((match = rx.exec(path)) !== null) {
        const [ part, ix ] = match
        const { index, input } = match
        if (index > 0) hops.push(input.substring(0, index - (ix ? 0 : 1)))
      }

      var existence = hops.map((p) => `o.${p}`).join(' && ')
      if (existence.length === 0) existence += `o.${path} != null`
      else existence += ` && o.${path} != null`

      const circularDetection = `
        switch (true) {
          ${hops.reverse().map((p) => `
            case o.${p} === censor: 
              secret[${escPath}].circle = ${JSON.stringify(p)}
              break
          `).join('\n')}
        }
      `
      return `
        if (${existence}) {
          const val = o.${path}
          if (val === censor) {
            secret[${escPath}].precensored = true
          } else {
            secret[${escPath}].val = val
            o.${path} = censor
            ${circularDetection}
          }
        }
      `
    }).join('\n') + '\nthis.compileRestore()\n' + (wcLen > 0 ? dynamicRedact : '') + returnResult

  return Function('o', str)
}
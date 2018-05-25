'use strict'

const { groupRestore, nestedRestore } = require('./modifiers')

module.exports = restorer

function restorer ({secret, wcLen}) {
  return function compileRestore () {
    if (this.restore) return
    const staticPaths = Object.keys(secret)
    const resetters = staticPaths
      .filter((path) => secret[path].precensored === false)
      .map((path) => `
        ${
          secret[path].circle ?
            `try { o.${secret[path].circle} = secret[${secret[path].escPath}].val } catch (e) {}` :
            `try { o.${path} = secret[${secret[path].escPath}].val } catch (e) {}` 
        }
        secret[${secret[path].escPath}].val = null
      `).join('\n')
    this.restore = Function('o', `
      const secret = this.secret
      ${
          resetters + (wcLen === 0 ? '' : `
            const keys = Object.keys(secret)
            const len = keys.length
            for (var i = ${staticPaths.length}; i < len; i++) {
              const k = keys[i]
              const o = secret[k]
              if (o.flat === true) this.groupRestore(o)
              else this.nestedRestore(o)
              secret[k] = null
            }
          `
        )
      }
      return o
    `).bind(wcLen > 0 ? {secret, groupRestore, nestedRestore} : {secret})
  }
}
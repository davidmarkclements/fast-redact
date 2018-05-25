'use strict'

const rx = require('./rx')

module.exports = parse

function parse ({paths, censor}) {
  const wildcards = []
  const secret = paths.reduce(function (o, strPath) {
    var path = strPath.match(rx).map((p) => p.replace(/'|"|`/g, ''))
    path = path.map((p) => {
      if (p[0] === '[') return p.substr(1, p.length -2)
      else return p
    })
    const star = path.indexOf('*')
    if (star > -1) {
      const before = path.slice(0, star)
      const beforeStr = before.join('.')
      const after = path.slice(star + 1, path.length)
      if (after.indexOf('*') > -1) throw Error('Only one wildcard per path is supported')
      const afterStr = after.join('.')
      const nested = after.length > 0

      wildcards.push({
        before,
        beforeStr,
        afterStr,
        after,
        nested
      })
    } else o[strPath] = {path: path, val: null, precensored: false, circle: '', escPath: JSON.stringify(strPath)}
    return o
  }, {})
  const wcLen = Object.keys(wildcards).length

  return { wildcards, wcLen, secret }
}
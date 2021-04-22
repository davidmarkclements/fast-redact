'use strict'

module.exports = {
  groupRedact,
  groupRestore,
  nestedRedact,
  nestedRestore
}

function groupRestore ({ keys, path, target }) {
  if (target == null) return
  const { getValue } = this.stash
  const length = keys.length
  const pathWithKey = [...path]
  const pathLength = path.length
  for (var i = 0; i < length; i++) {
    const k = keys[i]
    pathWithKey[pathLength] = k
    target[k] = getValue(pathWithKey)
  }
}

function groupRedact (o, path, censor, isCensorFct, censorFctTakesPath, { putValue }) {
  const target = get(o, path)
  if (target == null) return { keys: null, values: null, target: null, flat: true }
  const keys = Object.keys(target)
  const keysLength = keys.length
  const pathLength = path.length
  const pathWithKey = [...path]
  for (var i = 0; i < keysLength; i++) {
    const key = keys[i]
    pathWithKey[pathLength] = key
    putValue(pathWithKey, target[key])
    if (censorFctTakesPath) {
      target[key] = censor(target[key], pathWithKey)
    } else if (isCensorFct) {
      target[key] = censor(target[key])
    } else {
      target[key] = censor
    }
  }
  return { keys, target, path, flat: true }
}

function nestedRestore (arr) {
  const length = arr.length
  const { getValue } = this.stash
  for (var i = 0; i < length; i++) {
    const { key, target, path } = arr[i]
    target[key] = getValue(path)
  }
}

function nestedRedact (store, o, path, ns, censor, isCensorFct, censorFctTakesPath, { putValue }) {
  const target = get(o, path)
  if (target == null) return
  const keys = Object.keys(target)
  const keysLength = keys.length
  for (var i = 0; i < keysLength; i++) {
    const key = keys[i]
    const { value, parent, exists, fullPath } =
      specialSet(target, key, path, ns, censor, isCensorFct, censorFctTakesPath)

    if (exists === true && parent !== null) {
      putValue(fullPath, value)
      store.push({ key: ns[ns.length - 1], target: parent, path: fullPath })
    }
  }
  return store
}

function has (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

function specialSet (o, k, path, afterPath, censor, isCensorFct, censorFctTakesPath) {
  const afterPathLen = afterPath.length
  const lastPathIndex = afterPathLen - 1
  const originalKey = k
  var i = -1
  var n
  var nv
  var ov
  var oov = null
  var fullPath = null
  var exists = true
  ov = n = o[k]
  if (typeof n !== 'object') return { value: null, parent: null, exists }
  while (n != null && ++i < afterPathLen) {
    k = afterPath[i]
    oov = ov
    if (!(k in n)) {
      exists = false
      break
    }
    ov = n[k]
    fullPath = [...path, originalKey, ...afterPath]
    nv = (i !== lastPathIndex)
      ? ov
      : (isCensorFct
        ? (censorFctTakesPath ? censor(ov, fullPath) : censor(ov))
        : censor)
    n[k] = (has(n, k) && nv === ov) || (nv === undefined && censor !== undefined) ? n[k] : nv
    n = n[k]
    if (typeof n !== 'object') break
  }
  return { value: ov, parent: oov, fullPath, exists }
}

function get (o, p) {
  var i = -1
  var l = p.length
  var n = o
  while (n != null && ++i < l) {
    n = n[p[i]]
  }
  return n
}

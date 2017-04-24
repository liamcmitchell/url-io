import identity from 'lodash/identity'

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return identity
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

import {isObservable} from './isObservable'
import {rejectNotFound} from './rejectNotFound'
import isString from 'lodash/isString'
import {markSafeSource, createSafeSource} from './source'

export const isMethod = (method) => isString(method) && /^[A-Z_]+$/.test(method)

export const isObserveMethod = (method) => method === 'OBSERVE'

const ensureMethod = (method) => {
  if (!isMethod(method))
    throw new Error('Method must be upper case with underscores')
}

const createObservableSource = (observable) => () => observable

export const branchMethods = (methods) => (source) => {
  source = createSafeSource(source)

  const sources = {}

  for (const method in methods) {
    ensureMethod(method)

    const methodSource = methods[method]

    // Allow shorthand for defining observables.
    if (isObserveMethod(method) && isObservable(methodSource)) {
      sources[method] = createObservableSource(methodSource)
    } else {
      sources[method] = createSafeSource(methodSource, method)
    }
  }

  return markSafeSource((request) => {
    const {method} = request

    const methodSource = sources.hasOwnProperty(method)
      ? sources[method]
      : source

    return methodSource(request)
  })
}

export const methods = (methods) => {
  let defaultSource

  if (methods.hasOwnProperty('default')) {
    defaultSource = methods.default
    methods = Object.assign({}, methods)
    delete methods.default
  }

  return branchMethods(methods)(defaultSource || rejectNotFound)
}

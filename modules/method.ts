import {isObservable, isString} from './util'
import {rejectNotFound} from './rejectNotFound'
import {markSafeSource, createSafeSource, Source} from './source'
import {Observable} from 'rxjs'

export const isMethod = (method: unknown) =>
  isString(method) && /^[A-Z_]+$/.test(method)

export const isObserveMethod = (method: unknown) => method === 'OBSERVE'

const ensureMethod = (method: unknown) => {
  if (!isMethod(method))
    throw new Error('Method must be upper case with underscores')
}

const createObservableSource = (observable: Observable<unknown>) => () =>
  observable

type Methods = Record<string, Source>

export const branchMethods = (methods: Methods) => (source: Source) => {
  source = createSafeSource(source)

  const sources: Methods = {}

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

    const methodSource = Object.prototype.hasOwnProperty.call(sources, method)
      ? sources[method]
      : source

    return methodSource(request)
  })
}

export const methods = (methods: Methods) => {
  let defaultSource

  if (Object.prototype.hasOwnProperty.call(methods, 'default')) {
    defaultSource = methods.default
    methods = Object.assign({}, methods)
    delete methods.default
  }

  return branchMethods(methods)(defaultSource || rejectNotFound)
}

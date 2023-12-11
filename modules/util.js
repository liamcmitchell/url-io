export const isString = (o) => typeof o === 'string'

export const isObject = (o) => Boolean(o && typeof o === 'object')

export const isFunction = (o) => typeof o === 'function'

export const isObservable = (o) => Boolean(o && isFunction(o.subscribe))

export const isPromise = (o) => Boolean(o && isFunction(o.then))

export const noop = () => {}

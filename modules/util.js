export const isFunction = (o) => typeof o === 'function'

export const isObservable = (o) => o && isFunction(o.subscribe)

export const isPromise = (o) => o && isFunction(o.then)

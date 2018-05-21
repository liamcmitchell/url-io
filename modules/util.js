export const isFunction = (o) => typeof o === 'function'

export const isObservable = (o) => o && isFunction(o.subscribe)

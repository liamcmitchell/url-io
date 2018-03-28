import isFunction from 'lodash/isFunction'

export const isPromise = (o) => o && isFunction(o.then)

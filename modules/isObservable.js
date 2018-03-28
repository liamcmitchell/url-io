import isFunction from 'lodash/isFunction'

export const isObservable = (o) => o && isFunction(o.subscribe)

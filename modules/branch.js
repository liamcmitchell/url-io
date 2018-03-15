import isFunction from 'lodash/isFunction'

export const branch = (predicate, trueSource) => {
  if (!isFunction(predicate) || !isFunction(trueSource))
    throw new Error('predicate and trueSource must be functions')

  return (falseSource) => (request) =>
    predicate(request) ? trueSource(request) : falseSource(request)
}

import {isFunction} from './util'
import {markSafeSource, createSafeSource} from './source'

export const branch = (predicate, trueSource) => {
  if (!isFunction(predicate)) throw new Error('predicate must be a function')

  return (falseSource) => {
    trueSource = createSafeSource(trueSource)
    falseSource = createSafeSource(falseSource)

    return markSafeSource(
      (request) =>
        predicate(request) ? trueSource(request) : falseSource(request)
    )
  }
}

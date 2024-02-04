import {isFunction} from './util'
import {markSafeSource, createSafeSource, Source} from './source'
import {Request} from './request'

export const branch = (
  predicate: (request: Request) => boolean,
  trueSource: Source
) => {
  if (!isFunction(predicate)) throw new Error('predicate must be a function')

  return (falseSource: Source) => {
    trueSource = createSafeSource(trueSource)
    falseSource = createSafeSource(falseSource)

    return markSafeSource((request) =>
      predicate(request) ? trueSource(request) : falseSource(request)
    )
  }
}

import {fromPromise} from 'rxjs/observable/fromPromise'
import {switchMap} from 'rxjs/operators/switchMap'
import isFunction from 'lodash/isFunction'
import {markSafeSource, createSafeSource} from './source'
import {isObserve} from './isObserve'

// Allow loading source async.
// Function must return a promise that resolves to a source or
// an object with source as the "default" property (ES module).
// Example assuming source is default export:
// asyncSource(() => import('lazySource'))
export const asyncSource = (getSource) => {
  if (!isFunction(getSource)) throw new Error('getSource must be a function')

  // Cache to avoid using promises every time.
  let source = null

  return markSafeSource((request) => {
    if (source) return source(request)

    const sourcePromise = Promise.resolve()
      .then(getSource)
      .then((result) => {
        source = createSafeSource(
          isFunction(result) ? result : result.default,
          'asyncSource'
        )
      })

    const continueRequest = () => source(request)

    return isObserve(request)
      ? fromPromise(sourcePromise).pipe(switchMap(continueRequest))
      : sourcePromise.then(continueRequest)
  })
}

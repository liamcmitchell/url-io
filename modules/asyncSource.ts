import {from} from 'rxjs'
import {switchMap} from 'rxjs/operators'
import {isFunction} from './util'
import {markSafeSource, createSafeSource, Source, SafeSource} from './source'
import {isObserveRequest} from './request'

// Allow loading source async.
// Function must return a promise that resolves to a source or
// an object with source as the "default" property (ES module).
// Example assuming source is default export:
// asyncSource(() => import('lazySource'))
export const asyncSource = (
  getSource: () => Promise<Source | {default: Source}>
) => {
  if (!isFunction(getSource)) throw new Error('getSource must be a function')

  // Cache to avoid using promises every time.
  let source: SafeSource | null = null

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

    const continueRequest = () => source!(request)

    return isObserveRequest(request)
      ? from(sourcePromise).pipe(switchMap(continueRequest))
      : sourcePromise.then(continueRequest)
  })
}

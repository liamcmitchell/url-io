import {fromPromise} from 'rxjs/observable/fromPromise'
import {switchMap} from 'rxjs/operators/switchMap'
import isFunction from 'lodash/isFunction'

// Allow loading source async.
// Function must return a promise that resolves to a source or
// an object with source as the "default" property (ES module).
// Example assuming source is default export:
// asyncSource(() => import('lazySource'))
export const asyncSource = (getSource) => {
  if (!isFunction(getSource)) throw new Error('getSource must be a function')

  // Cache to avoid using promises every time.
  let source = null

  return (request) => {
    if (source) return source(request)

    const {method} = request

    const sourcePromise = getSource().then((result) => {
      if (isFunction(result)) source = result
      else if (isFunction(result.default)) source = result.default
      else throw new Error('getSource must resolve to a function')
    })

    const continueRequest = () => source(request)

    return method === 'OBSERVE'
      ? fromPromise(sourcePromise).pipe(switchMap(continueRequest))
      : sourcePromise.then(continueRequest)
  }
}

import {fromPromise} from 'rxjs/observable/fromPromise'
import {switchMap} from 'rxjs/operators/switchMap'

// Allow loading source async. Example:
// asyncSource(() => import('lazySource').then(m => m.default))
export default function asyncSource(getSource) {
  let source = null

  return (request) => {
    if (source) return source(request)

    const {method} = request

    const sourcePromise = getSource()

    // Cache to avoid using promises every time.
    sourcePromise.then((s) => (source = s))

    return method === 'OBSERVE'
      ? fromPromise(sourcePromise).pipe(switchMap((source) => source(request)))
      : sourcePromise.then((source) => source(request))
  }
}

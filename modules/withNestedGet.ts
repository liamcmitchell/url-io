import {pathToArray} from './path'
import {map} from 'rxjs/operators'
import {markSafeSource, createSafeSource, Source} from './source'
import {isObserveRequest} from './request'
import {Observable} from 'rxjs'

// Given an existing path & value: /value -> {a: 1}
// Allow accessing nested values: /value/a -> 1
export const withNestedGet = () => (source: Source) => {
  source = createSafeSource(source)

  return markSafeSource((request) => {
    const {path} = request

    if (isObserveRequest(request)) {
      const pathArray = pathToArray(path)

      if (pathArray.length) {
        return (
          source({
            ...request,
            // Ask for the root.
            path: '',
          }) as Observable<unknown>
        ).pipe(
          // And map to get nested val.
          map((v) => pathArray.reduce((prev, current) => prev?.[current], v))
        )
      }
    }

    return source(request)
  })
}

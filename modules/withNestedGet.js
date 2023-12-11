import {pathToArray} from './path'
import {map} from 'rxjs/operators'
import {markSafeSource, createSafeSource} from './source'
import {isObserveRequest} from './request'

// Given an existing path & value: /value -> {a: 1}
// Allow accessing nested values: /value/a -> 1
export const withNestedGet = () => (source) => {
  source = createSafeSource(source)

  return markSafeSource((request) => {
    const {path} = request

    if (isObserveRequest(request)) {
      const pathArray = pathToArray(path)

      if (pathArray.length) {
        return source({
          ...request,
          // Ask for the root.
          path: '',
        }).pipe(
          // And map to get nested val.
          map((v) => pathArray.reduce((prev, current) => prev?.[current], v))
        )
      }
    }

    return source(request)
  })
}

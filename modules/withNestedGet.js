import get from 'lodash/get'
import {pathToArray} from './path'
import {map} from 'rxjs/operators/map'
import {markSafeSource, createSafeSource} from './source'
import {isObserve} from './isObserve'

// Given an existing path & value: /value -> {a: 1}
// Allow accessing nested values: /value/a -> 1
// This will return undefined for any non-existing path.
// https://lodash.com/docs/4.17.4#get
export const withNestedGet = () => (source) => {
  source = createSafeSource(source)

  return markSafeSource((request) => {
    const {path} = request

    if (isObserve(request)) {
      const pathArray = pathToArray(path)

      if (pathArray.length) {
        return source(
          Object.assign({}, request, {
            // Ask for the root.
            path: '',
          })
        ).pipe(
          // And map to get nested val.
          map((v) => get(v, pathArray))
        )
      }
    }

    return source(request)
  })
}

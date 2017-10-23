import get from 'lodash/get'
import pathToArray from './pathToArray'
import {map} from 'rxjs/operators/map'

// Given an existing path & value: /value -> {a: 1}
// Allow accessing nested values: /value/a -> 1
// This will return undefined for any non-existing path.
// https://lodash.com/docs/4.17.4#get
export default function withNestedGet() {
  return source => request => {
    const {method, path} = request

    if (method === 'OBSERVE') {
      const pathArray = pathToArray(path)

      if (pathArray.length) {
        return source({
          ...request,
          // Ask for the root.
          path: ''
        })
          .pipe(
            // And map to get nested val.
            map(v => get(v, pathArray))
          )
      }
    }

    return source(request)
  }
}

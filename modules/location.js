import {paths} from './paths'
import {methods} from './methods'
import {Observable} from 'rxjs/Observable'

export function location(history) {
  if (
    !history ||
    !history.location ||
    !history.listen ||
    !history.push ||
    !history.replace ||
    !history.goBack
  ) {
    throw new Error(
      'history 4.x required: https://www.npmjs.com/package/history'
    )
  }

  return paths({
    '/': methods({
      OBSERVE: () =>
        Observable.create((observer) => {
          observer.next(history.location)
          return history.listen((location) => observer.next(location))
        }),
      PUSH: ({params}) => {
        history.push(params)
        return Promise.resolve()
      },
      REPLACE: ({params}) => {
        history.replace(params)
        return Promise.resolve()
      },
      GO_BACK: () => {
        history.goBack()
        return Promise.resolve()
      },
    }),
  })
}

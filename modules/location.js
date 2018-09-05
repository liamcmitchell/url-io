import {routes} from './routes'
import {Observable} from 'rxjs'

export const location = (history) => {
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

  return routes({
    OBSERVE: () =>
      Observable.create((observer) => {
        const subscription = history.listen((location) =>
          observer.next(location)
        )
        observer.next(history.location)
        return subscription
      }),
    PUSH: ({params}) => {
      history.push(params)
    },
    REPLACE: ({params}) => {
      history.replace(params)
    },
    GO_BACK: () => {
      history.goBack()
    },
  })
}

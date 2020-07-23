import {routes} from './routes'
import {Observable} from 'rxjs'

export const location = (history) => {
  if (
    !history ||
    !history.location ||
    !history.listen ||
    !history.push ||
    !history.replace ||
    !(history.goBack || history.back)
  ) {
    throw new Error(
      'history v4/5 required: https://www.npmjs.com/package/history'
    )
  }

  return routes({
    OBSERVE: () =>
      Observable.create((observer) => {
        const subscription = history.listen((location) =>
          // v4: Location is first arg.
          // v5: Location is nested in first arg.
          observer.next(location.location || location)
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
      // v4
      if (history.goBack) history.goBack()
      // v5
      else history.back()
    },
  })
}

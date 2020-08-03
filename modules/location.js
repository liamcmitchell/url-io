import {routes} from './routes'
import {Observable} from 'rxjs'

const standardLocation = ({pathname, search, hash, state, key}) => ({
  pathname,
  search,
  hash,
  // Prefer undefined to null, allows default args.
  state: state === null ? undefined : state,
  key,
})

const v4Location = ({pathname, search, hash, state}) => ({
  pathname,
  search,
  hash,
  state,
})

const v5Location = ({pathname, search, hash}) => ({
  pathname,
  search,
  hash,
})

const v5State = ({state}) => state

export const location = (history) => {
  if (
    process.env.NODE_ENV !== 'production' &&
    (!history ||
      !history.location ||
      !history.listen ||
      !history.push ||
      !history.replace ||
      !(history.goBack || history.back))
  ) {
    throw new Error(
      'history v4/5 required: https://www.npmjs.com/package/history'
    )
  }

  const isV4 = Boolean(history.goBack)

  return routes({
    OBSERVE: () =>
      Observable.create((observer) => {
        const subscription = history.listen((location) =>
          observer.next(standardLocation(isV4 ? location : location.location))
        )
        observer.next(standardLocation(history.location))
        return subscription
      }),
    PUSH: ({params}) => {
      if (isV4) history.push(v4Location(params))
      else history.push(v5Location(params), v5State(params))
    },
    REPLACE: ({params}) => {
      if (isV4) history.replace(v4Location(params))
      else history.replace(v5Location(params), v5State(params))
    },
    GO_BACK: () => {
      if (isV4) history.goBack()
      else history.back()
    },
  })
}

import {Params} from './request'
import {routes} from './routes'
import {Observable} from 'rxjs'

interface HistoryPath {
  pathname: string
  search: string
  hash: string
}

type HistoryState = unknown

interface HistoryLocation extends HistoryPath {
  state: HistoryState
  key: string
}

interface History4 {
  location: HistoryLocation
  listen(listener: (location: HistoryLocation) => void): () => void
  push(history: Partial<HistoryLocation>): void
  replace(history: Partial<HistoryLocation>): void
  goBack(): void
}

interface History5 {
  location: HistoryLocation
  listen(listener: (location: {location: HistoryLocation}) => void): () => void
  push(path: Partial<HistoryPath>, state: HistoryState): void
  replace(path: Partial<HistoryPath>, state: HistoryState): void
  back(): void
}

const isV4 = (history: History4 | History5): history is History4 =>
  Boolean((history as History4).goBack)

const standardLocation = ({
  pathname,
  search,
  hash,
  state,
  key,
}: HistoryLocation) => ({
  pathname,
  search,
  hash,
  // Prefer undefined to null, allows default args.
  state: state === null ? undefined : state,
  key,
})

const v4Location = ({pathname, search, hash, state}: Params) =>
  ({
    pathname,
    search,
    hash,
    state,
  }) as Partial<HistoryLocation>

const v5Path = ({pathname, search, hash}: Params) =>
  ({
    pathname,
    search,
    hash,
  }) as Partial<HistoryPath>

const v5State = ({state}: Params) => state

export const location = (history: History4 | History5) => {
  // istanbul ignore next
  if (
    process.env.NODE_ENV !== 'production' &&
    (!history ||
      !history.location ||
      !history.listen ||
      !history.push ||
      !history.replace ||
      !((history as History4).goBack || (history as History5).back))
  ) {
    throw new Error(
      'history v4/5 required: https://www.npmjs.com/package/history'
    )
  }

  return routes({
    OBSERVE: () =>
      new Observable((observer) => {
        const subscription = isV4(history)
          ? history.listen((location) =>
              observer.next(standardLocation(location))
            )
          : history.listen((location) =>
              observer.next(standardLocation(location.location))
            )
        observer.next(standardLocation(history.location))
        return subscription
      }),
    PUSH: ({params}) => {
      if (isV4(history)) history.push(v4Location(params))
      else history.push(v5Path(params), v5State(params))
    },
    REPLACE: ({params}) => {
      if (isV4(history)) history.replace(v4Location(params))
      else history.replace(v5Path(params), v5State(params))
    },
    GO_BACK: () => {
      if (isV4(history)) history.goBack()
      else history.back()
    },
  })
}

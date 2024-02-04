import {isFunction, isPromise} from './util'
import {reject} from './reject'
import {isObservable} from './util'
import {of, from, Observable} from 'rxjs'
import {Request, isObserveRequest} from './request'

export const isSource = isFunction

export type Source = ((request: Request) => unknown) & {safe?: boolean}

export type SafeSource = ((
  request: Request
) => Promise<unknown> | Observable<unknown>) & {safe?: boolean}

export const ensureSource = (source: Source, name?: string) => {
  if (!isSource(source)) {
    throw new Error(`Source must be a function ${name ? `(${name})` : ''}`)
  }
}

export const markSafeSource = (source: Source) => {
  source.safe = true
  return source as SafeSource
}

export const isSafeSource = (source: Source): source is SafeSource =>
  isSource(source) && source.safe === true

export const createSafeSource = (source: Source, name?: string) => {
  ensureSource(source, name)

  if (isSafeSource(source)) return source

  return markSafeSource((request) => {
    const {method, originalPath} = request
    try {
      const result = source(request)

      if (isObserveRequest(request)) {
        if (result === undefined)
          throw new Error(
            `Source for ${method} ${originalPath} returned undefined. If you want to emit undefined, wrap it in an observable.`
          )

        if (isObservable(result)) return result

        if (isPromise(result)) return from(result)

        return of(result)
      } else {
        return Promise.resolve(result)
      }
    } catch (error) {
      return reject(request, error)
    }
  })
}

/** @deprecated */
export const tryCatch = () => createSafeSource

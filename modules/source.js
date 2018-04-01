import isFunction from 'lodash/isFunction'
import {reject} from './reject'
import {isObservable} from './isObservable'
import {of} from 'rxjs/observable/of'
import {isObserve} from './isObserve'

export const isSource = isFunction

export const ensureSource = (source, name) => {
  if (!isSource(source)) {
    name = name ? `(${name})` : ''
    throw new Error(`Source must be a function ${name}`)
  }
}

export const markSafeSource = (source) => {
  source.safe = true
  return source
}

export const isSafeSource = (source) => isSource(source) && source.safe === true

export const createSafeSource = (source, name) => {
  ensureSource(source, name)

  if (isSafeSource(source)) return source

  return markSafeSource((request) => {
    const {method, originalPath} = request
    try {
      const result = source(request)

      if (isObserve(request)) {
        if (result === undefined)
          throw new Error(
            `Source for ${method} ${originalPath} didn't return anything. If you really want to return undefined, wrap it as an observable.`
          )

        if (isObservable(result)) return result

        return of(result)
      } else {
        return Promise.resolve(result)
      }
    } catch (error) {
      return reject(request, error)
    }
  })
}

// TODO: Remove
export const tryCatch = () => createSafeSource

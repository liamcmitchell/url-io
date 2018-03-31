import {reject} from './reject'
import {markSafeSource} from './source'

// Intended to be default response when request cannot be answered.
export const rejectNotFound = markSafeSource((request) => {
  const {method, originalPath} = request
  const error = new Error(
    `Source could not be found for ${method} ${originalPath}`
  )
  error.notFound = true
  return reject(request, error)
})

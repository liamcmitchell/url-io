import {reject} from './reject'

// Intended to be default response when request cannot be answered.
export const rejectNotFound = (request) => {
  const {method, originalPath} = request
  const error = new Error(
    `Source could not be found for ${method} ${originalPath}`
  )
  error.notFound = true
  return reject(request, error)
}

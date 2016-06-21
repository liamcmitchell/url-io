import {map} from 'rxjs/operator/map'

const parse = JSON.parse.bind(JSON)

// JSON transform.
// Stringifies request.value and parses OBSERVE and GET.
// Requires recursion (request.source).
export default function jsonSource(request) {
  request = Object.assign({}, request)

  // If sending a value, transform.
  if (request.hasOwnProperty('value')) {
    request.value = JSON.stringify(request.value, null, 2)
  }

  const result = request.source(request)

  if (request.method === 'OBSERVE') {
    return result::map(parse)
  }
  else if (request.method === 'GET') {
    return result.next(parse)
  }
  else {
    return result
  }
}

import {map} from 'rxjs/operator/map'

const parse = JSON.parse.bind(JSON)

// JSON transform.
// Stringifies request.value and parses OBSERVE.
export default function jsonSource(request) {
  const {io, url, method} = request

  request = Object.assign({}, request)

  // If sending a value, transform.
  if (request.hasOwnProperty('value')) {
    request.value = JSON.stringify(request.value, null, 2)
  }

  const result = io(url).request(request)

  if (method === 'OBSERVE') {
    return result::map(parse)
  }
  else {
    return result
  }
}

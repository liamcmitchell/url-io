import {map} from 'rxjs/operator/map'

const parse = ::JSON.parse

// JSON transform.
// Stringifies request.value and parses OBSERVE.
export default function jsonSource(request) {
  const {io, method, params} = request

  const result = io({
    ...request,
    params: {
      ...params,
      // If sending a value, transform.
      value : params.hasOwnProperty('value') ?
        JSON.stringify(params.value, null, 2) :
        params.value
    }
  })

  if (method === 'OBSERVE') {
    return result::map(parse)
  }
  else {
    return result
  }
}

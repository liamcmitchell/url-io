// Requires recursion (request.source).
export default function alias(upstreamUrl) {
  return function(request) {
    return request.source(Object.assign({}, request, {
      url: upstreamUrl + request.url
    }))
  }
}

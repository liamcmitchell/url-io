export default function alias(upstreamUrl) {
  return function(request) {
    const {io, url} = request
    return io(upstreamUrl + url).request(request)
  }
}

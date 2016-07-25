export default function alias(upstreamUrl) {
  return function({io, path, method, params}) {
    return io(upstreamUrl + path, method, params)
  }
}

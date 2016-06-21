export default function wrapRecursion(source) {
  return function recursion(request) {
    if (!request.source) {
      request.source = wrapRecursion(source)
    }
    return source(request)
  }
}

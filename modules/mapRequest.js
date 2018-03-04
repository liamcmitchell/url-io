export function mapRequest(mapper) {
  return (source) => (request) => source(mapper(request))
}

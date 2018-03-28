export const mapRequest = (mapper) => {
  return (source) => (request) => source(mapper(request))
}

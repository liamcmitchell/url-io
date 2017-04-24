export default function mapRequest(mapper) {
  return source => request => source(mapper(request))
}

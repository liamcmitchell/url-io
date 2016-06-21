export default function isObservable(o) {
  return o && typeof o.subscribe === 'function'
}

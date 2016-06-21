export default function isPromise(o) {
  return o && typeof o.then === 'function'
}

export default function wrap(wrapper, source) {
  if (typeof wrapper !== 'function') {
    throw new Error('wrap requires wrapper function')
  }

  source = source || this

  if (typeof source !== 'function') {
    throw new Error('wrap requires source function')
  }

  return wrapper.bind(null, source)
}

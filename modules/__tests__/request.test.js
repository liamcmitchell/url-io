import {
  ensureRequestKey,
  isObserveRequest,
  cacheKey,
  toRequest,
} from '../request'

describe('ensureRequestKey', () => {
  test('throws if key is not string', () => {
    expect(() => ensureRequestKey()).toThrow()
  })

  test('throws if key does not start with a-z', () => {
    expect(() => ensureRequestKey('A')).toThrow()
  })

  test('throws if key is reserved', () => {
    expect(() => ensureRequestKey('path')).toThrow()
  })
})

describe('isObserveRequest', () => {
  test('returns true when method is OBSERVE', () => {
    expect(isObserveRequest({method: 'OBSERVE'})).toBe(true)
  })

  test('returns false when method is not OBSERVE', () => {
    expect(isObserveRequest({method: 'OTHER'})).toBe(false)
  })
})

describe('cacheKey', () => {
  test('returns string containing path and params', () => {
    expect(cacheKey({path: 'path', params: {a: 1}})).toBe('path{"a":1}')
  })
})

describe('toRequest', () => {
  test('throws if path is not string', () => {
    expect(() => toRequest()).toThrow()
  })

  test('throws if path does not start with /', () => {
    expect(() => toRequest('')).toThrow()
  })

  test('throws if method is not string', () => {
    expect(() => toRequest({path: '/path', method: false})).toThrow()
  })

  test('throws if params is not an object', () => {
    expect(() => toRequest({path: '/path', params: false})).toThrow()
  })
})

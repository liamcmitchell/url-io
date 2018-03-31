import {cache} from '../cache'

describe('cache', () => {
  test('returns same observable for identical OBSERVE requests', () => {
    const source = cache()(() => 1)
    expect(source({method: 'OBSERVE', path: ''})).toBe(
      source({method: 'OBSERVE', path: ''})
    )
  })
})

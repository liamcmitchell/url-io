import {cache} from '../cache'

describe('cache', () => {
  test('passes through non-OBSERVE requests', () => {
    const source = cache()(() => 1)
    expect(source({method: 'other', path: ''})).resolves.toBe(1)
  })

  test('returns same observable for identical OBSERVE requests', () => {
    const source = cache()(() => 1)
    expect(source({method: 'OBSERVE', path: ''})).toBe(
      source({method: 'OBSERVE', path: ''})
    )
  })

  test('removes self from cache on finalize', () => {
    const source = cache()(() => 1)
    const o1 = source({method: 'OBSERVE', path: ''})

    expect(source({method: 'OBSERVE', path: ''})).toBe(o1)
    o1.subscribe().unsubscribe()
    expect(source({method: 'OBSERVE', path: ''})).not.toBe(o1)
  })
})

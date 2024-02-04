import {cache} from '../cache'

describe('cache', () => {
  test('passes through non-OBSERVE requests', () => {
    const source = cache()(() => 1)
    expect(source({method: 'other', path: ''})).resolves.toBe(1)
  })

  test('returns same observable for identical OBSERVE requests', () => {
    let subscriptions = 0
    const source = cache()(() => ++subscriptions)
    let value1
    source({method: 'OBSERVE', path: ''}).subscribe((v) => {
      value1 = v
    })
    expect(value1).toBe(1)
    let value2
    source({method: 'OBSERVE', path: ''}).subscribe((v) => {
      value2 = v
    })
    expect(value2).toBe(1)
    expect(subscriptions).toBe(1)
  })

  test('removes self from cache on finalize', () => {
    let subscriptions = 0
    const source = cache()(() => ++subscriptions)

    source({method: 'OBSERVE', path: ''}).subscribe().unsubscribe()
    source({method: 'OBSERVE', path: ''}).subscribe().unsubscribe()

    expect(subscriptions).toBe(2)
  })
})

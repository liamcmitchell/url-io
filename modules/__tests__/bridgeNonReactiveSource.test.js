import {bridgeNonReactiveSource} from '../bridgeNonReactiveSource'
import {take} from 'rxjs/operators/take'
import {bufferTime} from 'rxjs/operators/bufferTime'

describe('bridgeNonReactiveSource', () => {
  const source = (request) => {
    const {method} = request

    if (method === 'CACHE_CLEAR') return

    return request
  }

  test('turns OBSERVE into GET', () => {
    const wrappedSource = bridgeNonReactiveSource()(source)

    return wrappedSource({method: 'OBSERVE', path: ''})
      .pipe(take(1))
      .toPromise()
      .then((v) => {
        expect(v.method).toBe('GET')
      })
  })

  test('re-reads source on cache expiry', () => {
    const wrappedSource = bridgeNonReactiveSource({
      requestCacheTime: () => 20,
    })(source)

    return wrappedSource({method: 'OBSERVE', path: ''})
      .pipe(bufferTime(30), take(1))
      .toPromise()
      .then((emissions) => {
        expect(emissions.length).toBe(2)
        expect(emissions[0]).not.toBe(emissions[1])
      })
  })

  test('re-reads source on cache expiry triggered by non-OBSERVE', () => {
    const wrappedSource = bridgeNonReactiveSource()(source)

    setTimeout(() => wrappedSource({method: 'CACHE_CLEAR'}), 10)

    return wrappedSource({method: 'OBSERVE', path: ''})
      .pipe(bufferTime(30), take(1))
      .toPromise()
      .then((emissions) => {
        expect(emissions.length).toBe(2)
        expect(emissions[0]).not.toBe(emissions[1])
      })
  })

  test('re-reads source on cache expiry triggered by errored non-OBSERVE', () => {
    const wrappedSource = bridgeNonReactiveSource()(({method}) => {
      if (method === 'ERROR') throw new Error('YOLO')
      return Date.now()
    })

    setTimeout(() => wrappedSource({method: 'ERROR'}).catch(() => {}), 10)

    return wrappedSource({method: 'OBSERVE', path: ''})
      .pipe(bufferTime(30), take(1))
      .toPromise()
      .then((emissions) => {
        expect(emissions.length).toBe(2)
        expect(emissions[0]).not.toBe(emissions[1])
      })
  })

  test('returns cached value', async () => {
    const source = jest.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 10)
        })
    )
    const wrappedSource = bridgeNonReactiveSource()(source)

    await Promise.all([
      wrappedSource({method: 'GET', path: ''}),
      wrappedSource({method: 'GET', path: ''}),
    ])

    expect(source).toHaveBeenCalledTimes(1)
  })

  test('returns cached value synchronously if possible', async () => {
    const wrappedSource = bridgeNonReactiveSource()(source)

    await wrappedSource({method: 'GET', path: ''})

    const next = jest.fn()

    wrappedSource({method: 'OBSERVE', path: ''})
      .subscribe(next)
      .unsubscribe()

    expect(next).toHaveBeenCalledTimes(1)
  })

  test('does not cache errors', async () => {
    const source = jest.fn(() => {
      throw new Error('YOLO')
    })
    const wrappedSource = bridgeNonReactiveSource()(source)

    await expect(wrappedSource({method: 'GET', path: ''})).rejects.toThrow()
    await expect(wrappedSource({method: 'GET', path: ''})).rejects.toThrow()

    expect(source).toHaveBeenCalledTimes(2)
  })

  test('handles missing cacheInvalidationIterator', async () => {
    const wrappedSource = bridgeNonReactiveSource({
      requestCacheInvalidationIterator: () => false,
    })(source)

    await expect(wrappedSource({method: 'POST', path: ''}))
  })
})

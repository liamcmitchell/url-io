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
})

import {asyncSource} from '../asyncSource'

describe('asyncSource', () => {
  test('throws if no function provided', () => {
    expect(() => {
      asyncSource()
    }).toThrow()
  })

  test('returns observable from async source', (done) => {
    const source = () => 1
    const sourceLoadedAsync = asyncSource(() => Promise.resolve(source))

    sourceLoadedAsync({method: 'OBSERVE'}).subscribe((v) => {
      expect(v).toBe(1)
      done()
    })
  })

  test('returns promise from async source', () => {
    const source = () => 1
    const sourceLoadedAsync = asyncSource(() => Promise.resolve(source))

    return expect(sourceLoadedAsync({method: 'OTHER'})).resolves.toBe(1)
  })

  test('source load fn is cached', () => {
    const source = () => 1
    const sourceLoader = jest.fn(() => Promise.resolve(source))
    const sourceLoadedAsync = asyncSource(sourceLoader)

    return sourceLoadedAsync({method: 'OTHER'})
      .then(() => sourceLoadedAsync({method: 'OTHER'}))
      .then(() => {
        expect(sourceLoader).toHaveBeenCalledTimes(1)
      })
  })

  test('supports source resolved as default export', () => {
    const source = () => 1
    const sourceLoadedAsync = asyncSource(() =>
      Promise.resolve({default: source})
    )

    return expect(sourceLoadedAsync({method: 'OTHER'})).resolves.toBe(1)
  })
})

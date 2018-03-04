import {asyncSource} from '../asyncSource'
import {of} from 'rxjs/observable/of'

describe('asyncSource', () => {
  test('returns observable from async source', (done) => {
    const source = () => of(1)
    const sourceLoadedAsync = asyncSource(() => Promise.resolve(source))

    sourceLoadedAsync({method: 'OBSERVE'}).subscribe((v) => {
      expect(v).toBe(1)
      done()
    })
  })

  test('returns promise from async source', () => {
    const source = () => Promise.resolve(1)
    const sourceLoadedAsync = asyncSource(() => Promise.resolve(source))

    return sourceLoadedAsync({method: 'OTHER'}).then((v) => {
      expect(v).toBe(1)
    })
  })

  test('source load fn is cached', () => {
    const source = () => Promise.resolve(1)
    const sourceLoader = jest.fn(() => Promise.resolve(source))
    const sourceLoadedAsync = asyncSource(sourceLoader)

    return sourceLoadedAsync({method: 'OTHER'})
      .then(() => sourceLoadedAsync({method: 'OTHER'}))
      .then(() => {
        expect(sourceLoader).toHaveBeenCalledTimes(1)
      })
  })
})

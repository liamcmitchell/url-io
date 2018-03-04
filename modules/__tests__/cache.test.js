import {cache} from '../cache'
import {of} from 'rxjs/observable/of'

describe('cache', () => {
  test('returns same observable for identical OBSERVE requests', () => {
    const source = cache()(() => of(1))
    expect(source({method: 'OBSERVE', path: ''})).toBe(
      source({method: 'OBSERVE', path: ''})
    )
  })
})

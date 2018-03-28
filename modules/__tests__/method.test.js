import {methods} from '../method'
import {of} from 'rxjs/observable/of'

describe('methods', () => {
  test('routes request according to method', () => {
    const source = methods({
      OBSERVE: () => of('a'),
      MUTATE: () => Promise.resolve(),
    })

    return Promise.all([
      expect(source({method: 'OBSERVE'}).toPromise()).resolves.toBe('a'),
      expect(source({method: 'MUTATE'})).resolves.toBe(undefined),
    ])
  })

  test('allows providing default source', () => {
    const source = methods({
      default: ({method}) => Promise.resolve(method),
    })

    return Promise.all([
      expect(source({method: 'MUTATE'})).resolves.toBe('MUTATE'),
    ])
  })
})

import {methods} from '../method'

describe('methods', () => {
  test('routes request according to method', () => {
    const source = methods({
      OBSERVE: () => 'OBSERVE',
      OTHER: () => 'OTHER',
    })

    return Promise.all([
      expect(source({method: 'OBSERVE'}).toPromise()).resolves.toBe('OBSERVE'),
      expect(source({method: 'OTHER'})).resolves.toBe('OTHER'),
    ])
  })

  test('allows providing default source', () => {
    const source = methods({
      default: ({method}) => method,
    })

    return Promise.all([
      expect(source({method: 'OTHER'})).resolves.toBe('OTHER'),
    ])
  })
})

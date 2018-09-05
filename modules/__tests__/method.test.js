import {isMethod, isObserveMethod, branchMethods, methods} from '../method'
import {of} from 'rxjs'

describe('isMethod', () => {
  test('requires all caps string', () => {
    expect(isMethod()).toBe(false)
    expect(isMethod('')).toBe(false)
    expect(isMethod('method')).toBe(false)
    expect(isMethod('METHOD')).toBe(true)
  })
})

describe('isObserveMethod', () => {
  test('requires OBSERVE', () => {
    expect(isObserveMethod('observe')).toBe(false)
    expect(isObserveMethod('OBSERVE')).toBe(true)
  })
})

describe('branchMethods', () => {
  test('branches request according to method', () => {
    const source = branchMethods({
      OBSERVE: () => 'OBSERVE',
      OTHER: () => 'OTHER',
    })(() => false)

    return Promise.all([
      expect(source({method: 'OBSERVE'}).toPromise()).resolves.toBe('OBSERVE'),
      expect(source({method: 'OTHER'})).resolves.toBe('OTHER'),
      expect(source({method: 'ANOTHER'})).resolves.toBe(false),
    ])
  })
})

describe('methods', () => {
  test('throws if non-method key given', () => {
    expect(() =>
      methods({
        ' ': () => null,
      })
    ).toThrow()
  })

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

  test('allows observable shorthand', () => {
    const source = methods({
      OBSERVE: of(1),
    })

    return expect(source({method: 'OBSERVE'}).toPromise()).resolves.toBe(1)
  })
})

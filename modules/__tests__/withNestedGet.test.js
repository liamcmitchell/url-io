import {withNestedGet} from '../withNestedGet'

describe('withNestedGet', () => {
  test('routes request according to path', () => {
    const source = withNestedGet()(() => ({a: 'a'}))

    return Promise.all([
      expect(
        source({method: 'OBSERVE', path: ''}).toPromise()
      ).resolves.toEqual({a: 'a'}),
      expect(
        source({method: 'OBSERVE', path: 'a'}).toPromise()
      ).resolves.toEqual('a'),
    ])
  })
})

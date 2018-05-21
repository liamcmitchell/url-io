import {withNestedGet} from '../withNestedGet'

describe('withNestedGet', () => {
  test('does not touch non-OBSERVE requests', () => {
    const source = withNestedGet()(({path}) => path)

    return expect(source({method: 'OTHER', path: 'a'})).resolves.toEqual('a')
  })

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

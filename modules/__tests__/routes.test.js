import {routes} from '../routes'

describe('routes', () => {
  test('routes request by path', () => {
    const source = routes({
      '/a': () => 'a',
    })

    return Promise.all([
      expect(source({path: 'a'})).resolves.toBe('a'),
      expect(source({path: 'b'})).rejects.toThrow('found'),
    ])
  })

  test('routes request by method', () => {
    const source = routes({
      GET_A: () => 'a',
    })

    return Promise.all([
      expect(source({path: '', method: 'GET_A'})).resolves.toBe('a'),
      expect(source({path: 'other', method: 'GET_A'})).rejects.toThrow('found'),
      expect(source({path: '', method: 'OTHER'})).rejects.toThrow('found'),
    ])
  })

  test('throws if root and method are defined', () => {
    expect(() => {
      routes({
        '/': () => {},
        OBSERVE: () => {},
      })
    }).toThrow()
  })

  test('routes request with token path', () => {
    const source = routes({
      '/:token': (request) => request,
    })

    return Promise.all([
      expect(source({path: 'thisPath/nextPath'})).resolves.toEqual({
        token: 'thisPath',
        path: 'nextPath',
      }),

      expect(source({path: ''})).rejects.toThrow('found'),
    ])
  })

  test('throws if more than one token path is defined', () => {
    expect(() => {
      routes({
        '/:token1': () => {},
        '/:token2': () => {},
      })
    }).toThrow()
  })

  test('routes nested routes', () => {
    const echoSource = (request) => request

    const source = routes({
      METHOD: echoSource,
      '/path': echoSource,
      '/nested': {
        METHOD: echoSource,
        '/path': echoSource,
        '/:token': echoSource,
      },
      '/:token': echoSource,
    })

    return Promise.all([
      expect(source({path: ''})).rejects.toThrow('found'),

      expect(source({method: 'METHOD', path: ''})).resolves.toEqual({
        method: 'METHOD',
        path: '',
      }),

      expect(source({path: 'path'})).resolves.toEqual({
        path: '',
      }),

      expect(source({path: 'token/next'})).resolves.toEqual({
        path: 'next',
        token: 'token',
      }),

      expect(source({path: 'nested'})).rejects.toThrow('found'),

      expect(source({path: 'nested', method: 'METHOD'})).resolves.toEqual({
        method: 'METHOD',
        path: '',
      }),

      expect(source({path: 'nested/path'})).resolves.toEqual({
        path: '',
      }),

      expect(source({path: 'nested/token/next'})).resolves.toEqual({
        path: 'next',
        token: 'token',
      }),
    ])
  })
})

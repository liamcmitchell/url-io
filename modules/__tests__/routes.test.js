import {routes} from '../routes'

describe('routes', () => {
  test('throws if object not given', () => {
    expect(() => {
      routes()
    }).toThrow()
  })

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

    return expect(source({path: 'thisPath/nextPath'})).resolves.toEqual({
      token: 'thisPath',
      path: 'nextPath',
    })
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
      '/': {
        METHOD: echoSource,
      },
      '/nested': {
        '/:token': echoSource,
      },
    })

    return Promise.all([
      expect(source({path: '', METHOD: 'OTHER'})).rejects.toThrow('found'),

      expect(source({path: '', method: 'METHOD'})).resolves.toEqual({
        path: '',
        method: 'METHOD',
      }),

      expect(source({path: 'nested/path'})).resolves.toEqual({
        path: '',
        token: 'path',
      }),

      expect(source({path: 'nested/token/next'})).resolves.toEqual({
        path: 'next',
        token: 'token',
      }),
    ])
  })
})

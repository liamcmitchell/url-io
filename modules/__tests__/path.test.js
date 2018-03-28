import {paths} from '../path'

describe('paths', () => {
  test('routes request according to path', () => {
    const source = paths({
      '/': () => {},
      '/a': () => 'a',
    })

    expect(source({path: 'a'})).toBe('a')
    return expect(source({path: 'b'})).rejects.toThrow('found')
  })

  test('rewrites path as expected', () => {
    const source = paths({
      '/request': (request) => request,
    })

    expect(source({path: 'request/nextPath'})).toEqual({path: 'nextPath'})
  })

  test('routes token path as expected', () => {
    const source = paths({
      '/:token': (request) => request,
    })

    expect(source({path: 'thisPath/nextPath'})).toEqual({
      token: 'thisPath',
      path: 'nextPath',
    })

    expect(source({path: ''})).toEqual({
      token: '',
      path: '',
    })
  })

  test('throws if more than one token path is defined', () => {
    expect(() => {
      paths({
        '/:token1': () => {},
        '/:token2': () => {},
      })
    }).toThrow()
  })
})

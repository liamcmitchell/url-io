import {
  isPath,
  currentPath,
  currentNextPath,
  nextPath,
  isTokenPath,
  withPathToken,
  branchPaths,
  paths,
  pathToArray,
  pathToString,
} from '../path'

describe('isPath', () => {
  test('requires leading slash and no more slashes', () => {
    expect(isPath('/')).toBe(true)
    expect(isPath('/path')).toBe(true)
    expect(isPath()).toBe(false)
    expect(isPath('')).toBe(false)
    expect(isPath('x')).toBe(false)
    expect(isPath('//')).toBe(false)
  })
})

describe('currentPath', () => {
  test('returns path up to the next slash', () => {
    expect(currentPath('')).toBe('')
    expect(currentPath('first')).toBe('first')
    expect(currentPath('first/second')).toBe('first')
    expect(currentPath('/x')).toBe('')
  })
})

describe('nextPath', () => {
  test('returns path from the next slash', () => {
    expect(nextPath('')).toBe('')
    expect(nextPath('first')).toBe('')
    expect(nextPath('first/second')).toBe('second')
    expect(nextPath('first/second/third')).toBe('second/third')
    expect(nextPath('/x')).toBe('x')
  })
})

describe('currentNextPath', () => {
  test('returns path up to the next slash', () => {
    expect(currentNextPath('')).toEqual(['', ''])
    expect(currentNextPath('first')).toEqual(['first', ''])
    expect(currentNextPath('first/second')).toEqual(['first', 'second'])
    expect(currentNextPath('first/second/third')).toEqual([
      'first',
      'second/third',
    ])
    expect(currentNextPath('/x')).toEqual(['', 'x'])
  })
})

describe('isTokenPath', () => {
  test('requires path starting with colon', () => {
    expect(isTokenPath('/path')).toBe(false)
    expect(isTokenPath('/:path')).toBe(true)
  })
})

describe('pathToArray', () => {
  test('converts path to arry', () => {
    expect(pathToArray('one/two')).toEqual(['one', 'two'])
    expect(pathToArray(['one', 'two'])).toEqual(['one', 'two'])
  })
})

describe('pathToString', () => {
  test('converts path to string', () => {
    expect(pathToString('one/two')).toEqual('one/two')
    expect(pathToString(['one', 'two'])).toEqual('one/two')
  })
})

describe('withPathToken', () => {
  test('adds current path to request as token', () => {
    const source = withPathToken('/:token')((request) => request)

    return Promise.all([
      expect(source({path: 'current/next'})).resolves.toEqual({
        token: 'current',
        path: 'next',
      }),
      expect(source({path: ''})).resolves.toEqual({
        token: '',
        path: '',
      }),
    ])
  })

  test('throws if token path is not valid', () => {
    expect(() => {
      withPathToken('/not-token')(() => {})
    }).toThrow('/:')
  })
})

describe('branchPaths', () => {
  test('throws if path is not valid', () => {
    expect(() =>
      branchPaths({
        'bad/a': (request) => request,
      })(() => false)
    ).toThrow()
  })

  test('branches request according to path', () => {
    const source = branchPaths({
      '/a': (request) => request,
    })(() => false)

    return Promise.all([
      expect(source({path: 'a'})).resolves.toEqual({path: ''}),
      expect(source({path: 'a/b'})).resolves.toEqual({path: 'b'}),
      expect(source({path: 'b'})).resolves.toBe(false),
    ])
  })
})

describe('paths', () => {
  test('routes request according to path', () => {
    const source = paths({
      '/a': () => 'a',
    })

    return Promise.all([
      expect(source({path: 'a'})).resolves.toBe('a'),
      expect(source({path: 'b'})).rejects.toThrow('found'),
    ])
  })

  test('rewrites path as expected', () => {
    const source = paths({
      '/request': (request) => request,
    })

    return expect(source({path: 'request/next'})).resolves.toEqual({
      path: 'next',
    })
  })

  test('routes token path as expected', () => {
    const source = paths({
      '/:token': (request) => request,
    })

    return Promise.all([
      expect(source({path: 'current/next'})).resolves.toEqual({
        token: 'current',
        path: 'next',
      }),
      expect(source({path: ''})).resolves.toEqual({
        token: '',
        path: '',
      }),
    ])
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

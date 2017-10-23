import createIO from '../createIO'
import $$observable from 'symbol-observable'
import {Observable} from 'rxjs/Observable'
import {of} from 'rxjs/observable/of'

describe('createIO', () => {
  test('returns function', () => {
    expect(createIO(() => {})).toBeInstanceOf(Function)
  })

  test('throws when not given function', () => {
    expect(() => createIO()).toThrow()
  })
})

describe('io', () => {
  const io = createIO((request) => {
    const {method, path} = request

    if (path === 'badsource') return

    if (path === 'verybadsource') throw new Error('Broken')

    return method === 'OBSERVE' ?
      of(request) :
      Promise.resolve(request)
  })

  test('returns observable (with promise method) for OBSERVE requests', () => {
    const result = io('/')
    expect(result.subscribe).toBeInstanceOf(Function)
    expect(result[$$observable]().subscribe).toBeInstanceOf(Function)
    expect(result.then).toBeInstanceOf(Function)
  })

  test('returns promise for non-OBSERVE requests', () => {
    expect(io('/', 'OTHER').then).toBeInstanceOf(Function)
  })

  test('sets default request values', () => {
    return io('/').then((request) => {
      expect(request).toEqual({
        io,
        path: '',
        originalPath: '/',
        method: 'OBSERVE',
        params: {},
      })
    })
  })

  test('handles shorthand arguments', () => {
    return io('/path', 'METHOD', {var: 1}).then((request) => {
      expect(request).toEqual({
        io,
        path: 'path',
        originalPath: '/path',
        method: 'METHOD',
        params: {
          var: 1,
        },
      })
    })
  })

  test('handles full request argument', () => {
    return io({
      path: '/path',
      method: 'METHOD',
      params: {
        var: 1,
      },
      extraArg: 1,
    }).then((request) => {
      expect(request).toEqual({
        io,
        path: 'path',
        originalPath: '/path',
        method: 'METHOD',
        params: {
          var: 1,
        },
        extraArg: 1,
      })
    })
  })

  test('handles sources returning non-Observable for OBSERVE', () => {
    return expect(io('/badsource')).rejects.toBeDefined()
  })

  test('handles sources returning non-Promise for non-OBSERVE', () => {
    return expect(io('/badsource', 'OTHER')).rejects.toBeDefined()
  })

  test('handles sources throwing errors for OBSERVE', () => {
    return expect(io('/verybadsource')).rejects.toBeDefined()
  })

  test('handles sources throwing errors for non-OBSERVE', () => {
    return expect(io('/verybadsource', 'OTHER')).rejects.toBeDefined()
  })
})

describe('observable cache', () => {
  const io = createIO(() => new Observable((observer) => {
    observer.next(Date.now())
  }))

  test('shares observable for the same path', (done) => {
    let cachedValue
    io('/one').subscribe((v) => cachedValue = v)

    setTimeout(() => {
      Promise.all([
        io('/one'),
        io('/two'),
      ])
      .then(([one, two]) => {
        expect(one).toBe(cachedValue)
        expect(two).not.toBe(cachedValue)
        done()
      })
    }, 100)
  })

})

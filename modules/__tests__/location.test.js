import {createIO} from '../createIO'
import {location} from '../location'
import {createMemoryHistory} from 'history'

// Mock v4 API.
const createV4MemoryHistory = () => {
  const history = createMemoryHistory()

  // back was named goBack
  history.goBack = history.back
  history.back = null

  // action was passed as a second arg
  const listen = history.listen
  history.listen = (cb) => {
    return listen.call(history, ({location, action}) => {
      cb(location, action)
    })
  }

  // push and replace accepted state in location object
  const push = history.push
  history.push = ({state, ...location}) => {
    return push.call(history, location, state)
  }
  const replace = history.replace
  history.replace = ({state, ...location}) => {
    return replace.call(history, location, state)
  }

  return history
}

const historyVersions = [
  ['v4', createV4MemoryHistory],
  ['v5', createMemoryHistory],
]

for (const [version, createHistory] of historyVersions) {
  describe(`location (${version} history API)`, () => {
    test('observe', async () => {
      const io = createIO(location(createHistory()))

      await expect(io('/')).resolves.toEqual({
        pathname: '/',
        search: '',
        hash: '',
        state: undefined,
        key: expect.any(String),
      })
    })

    test('push', async () => {
      const io = createIO(location(createHistory()))

      await io('/', 'PUSH', {
        pathname: '/new',
        search: '?s',
        hash: '#h',
        state: {a: 1},
      })

      await expect(io('/')).resolves.toEqual({
        pathname: '/new',
        search: '?s',
        hash: '#h',
        state: {a: 1},
        key: expect.any(String),
      })
    })

    test('replace', async () => {
      const io = createIO(location(createHistory()))

      await io('/', 'REPLACE', {
        pathname: '/new',
        search: '?s',
        hash: '#h',
        state: {a: 1},
      })

      await expect(io('/')).resolves.toEqual({
        pathname: '/new',
        search: '?s',
        hash: '#h',
        state: {a: 1},
        key: expect.any(String),
      })
    })

    test('go back', async () => {
      const io = createIO(location(createHistory()))

      await io('/', 'PUSH', {pathname: '/new'})
      await io('/', 'GO_BACK')

      await expect(io('/')).resolves.toEqual({
        pathname: '/',
        search: '',
        hash: '',
        state: undefined,
        key: expect.any(String),
      })
    })

    test('nested push', async () => {
      const io = createIO(location(createHistory()))

      const pathnames = []

      io('/').subscribe(({pathname}) => {
        pathnames.push(pathname)

        // Simulate synchronously updating location.
        if (pathname === '/') io('/', 'PUSH', {pathname: '/new'})
      })

      expect(pathnames).toEqual(['/', '/new'])
    })
  })
}

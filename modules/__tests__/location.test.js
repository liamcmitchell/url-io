import {createIO} from '../createIO'
import {location} from '../location'
import {createMemoryHistory} from 'history'

// Mock v4 API.
const createV4MemoryHistory = () => {
  const history = createMemoryHistory()
  history.goBack = history.back
  history.back = null
  const listen = history.listen
  history.listen = (cb) => {
    return listen.call(history, ({location, action}) => {
      cb(location, action)
    })
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

      await expect(io('/')).resolves.toEqual(
        expect.objectContaining({pathname: '/'})
      )
    })

    test('push', async () => {
      const io = createIO(location(createHistory()))

      await io('/', 'PUSH', {pathname: '/new'})

      await expect(io('/')).resolves.toEqual(
        expect.objectContaining({pathname: '/new'})
      )
    })

    test('replace', async () => {
      const io = createIO(location(createHistory()))

      await io('/', 'REPLACE', {pathname: '/new'})

      await expect(io('/')).resolves.toEqual(
        expect.objectContaining({pathname: '/new'})
      )
    })

    test('go back', async () => {
      const io = createIO(location(createHistory()))

      await io('/', 'PUSH', {pathname: '/new'})
      await io('/', 'GO_BACK')

      await expect(io('/')).resolves.toEqual(
        expect.objectContaining({pathname: '/'})
      )
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

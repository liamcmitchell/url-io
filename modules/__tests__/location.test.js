import {createIO} from '../createIO'
import {location} from '../location'
import {createMemoryHistory} from 'history'

describe('location', () => {
  test('observe', async () => {
    const io = createIO(location(createMemoryHistory()))

    await expect(io('/')).resolves.toEqual(
      expect.objectContaining({pathname: '/'})
    )
  })

  test('push', async () => {
    const io = createIO(location(createMemoryHistory()))

    await io('/', 'PUSH', {pathname: '/new'})

    await expect(io('/')).resolves.toEqual(
      expect.objectContaining({pathname: '/new'})
    )
  })

  test('replace', async () => {
    const io = createIO(location(createMemoryHistory()))

    await io('/', 'REPLACE', {pathname: '/new'})

    await expect(io('/')).resolves.toEqual(
      expect.objectContaining({pathname: '/new'})
    )
  })

  test('go back', async () => {
    const io = createIO(location(createMemoryHistory()))

    await io('/', 'PUSH', {pathname: '/new'})
    await io('/', 'GO_BACK')

    await expect(io('/')).resolves.toEqual(
      expect.objectContaining({pathname: '/'})
    )
  })

  test('nested push', async () => {
    const io = createIO(location(createMemoryHistory()))

    const pathnames = []

    io('/').subscribe(({pathname}) => {
      pathnames.push(pathname)

      // Simulate synchronously updating location.
      if (pathname === '/') io('/', 'PUSH', {pathname: '/new'})
    })

    expect(pathnames).toEqual(['/', '/new'])
  })
})

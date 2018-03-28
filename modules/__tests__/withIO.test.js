import {createIO} from '../createIO'
import {paths} from '../path'
import {withIO} from '../withIO'
import {of} from 'rxjs/observable/of'

describe('withIO', () => {
  const echoSource = (request) => {
    const {method} = request

    return method === 'OBSERVE' ? of(request) : Promise.resolve(request)
  }

  const io = createIO(
    paths({
      '/a': () => of('a'),
      '/static': withIO({
        a: '/a',
      })(echoSource),
      '/dynamic': withIO(({params: {path}}) => ({
        a: path,
      }))(echoSource),
      '/observable': withIO({
        a: of('a'),
      })(echoSource),
    })
  )

  test('resolves nested static io request for OBSERVE', () => {
    return expect(io('/static')).resolves.toMatchObject({a: 'a'})
  })

  test('resolves nested dynamic io request for OBSERVE', () => {
    return expect(io('/dynamic', {path: '/a'})).resolves.toMatchObject({a: 'a'})
  })

  test('resolves nested observable for OBSERVE', () => {
    return expect(io('/observable')).resolves.toMatchObject({a: 'a'})
  })

  test('resolves nested static io request for OTHER', () => {
    return expect(io('/static', 'OTHER')).resolves.toMatchObject({a: 'a'})
  })

  test('resolves nested dynamic io request for OTHER', () => {
    return expect(io('/dynamic', 'OTHER', {path: '/a'})).resolves.toMatchObject(
      {a: 'a'}
    )
  })

  test('resolves nested observable for OTHER', () => {
    return expect(io('/observable', 'OTHER')).resolves.toMatchObject({a: 'a'})
  })
})

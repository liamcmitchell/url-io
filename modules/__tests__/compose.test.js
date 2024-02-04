import {branch} from '../branch'
import {compose} from '../compose'

describe('compose', () => {
  test('composes multiple higher order sources', () => {
    const source = compose(
      branch(
        ({path}) => path === '1',
        () => 1
      ),
      branch(
        ({path}) => path === '2',
        () => 2
      )
    )(() => 0)

    expect(source({path: '1'})).resolves.toBe(1)
    expect(source({path: '2'})).resolves.toBe(2)
    expect(source({path: '3'})).resolves.toBe(0)
  })
})

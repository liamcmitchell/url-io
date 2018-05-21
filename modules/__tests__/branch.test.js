import {branch} from '../branch'

describe('branch', () => {
  test('throws if no function provided', () => {
    expect(() => {
      branch()
    }).toThrow()
  })

  test('passes request to source according to predicate result', () => {
    const predicate = ({path}) => path === 'true'
    const trueSource = () => true
    const falseSource = () => false
    const source = branch(predicate, trueSource)(falseSource)

    expect(source({path: 'true'})).resolves.toBe(true)
    expect(source({path: 'false'})).resolves.toBe(false)
  })
})

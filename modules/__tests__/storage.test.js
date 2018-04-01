import {storage} from '../storage'
import {take} from 'rxjs/operators/take'
import {toArray} from 'rxjs/operators/toArray'

class MockStorage {
  constructor(values = {}) {
    this.values = values
  }

  getItem(key) {
    return this.values.hasOwnProperty(key) ? this.values[key] : null
  }

  setItem(key, value) {
    this.values[key] = String(value)
  }
}

describe('storage', () => {
  test('gets storage value', () => {
    const source = storage(new MockStorage({key: 'true'}))

    return expect(
      source({method: 'OBSERVE', path: 'key'})
        .pipe(take(1))
        .toPromise()
    ).resolves.toBe(true)
  })

  test('updates storage value', () => {
    const Storage = new MockStorage()
    const source = storage(Storage)

    const values = source({method: 'OBSERVE', path: 'key'})
      .pipe(take(2), toArray())
      .toPromise()

    source({method: 'SET', path: 'key', params: {value: true}})

    expect(Storage.values.key).toBe('true')

    return expect(values).resolves.toEqual([null, true])
  })

  test('listens to window storage updates', () => {
    const Storage = new MockStorage()
    const source = storage(Storage)

    const values = source({method: 'OBSERVE', path: 'key'})
      .pipe(take(2), toArray())
      .toPromise()

    const event = new Event('storage')
    event.key = 'key'
    event.storageArea = Storage
    event.newValue = 'true'
    window.dispatchEvent(event)

    return expect(values).resolves.toEqual([null, true])
  })
})

import {storage} from '../storage'
import {take, toArray} from 'rxjs/operators'

class MockStorage {
  constructor(values = {}) {
    this.values = values
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.values, key)
      ? this.values[key]
      : null
  }

  setItem(key, value) {
    this.values[key] = String(value)
  }
}

describe('storage', () => {
  test('throws if storage interface not provided', () => {
    expect(() => storage()).toThrow()
  })

  test('gets storage value', () => {
    const source = storage(new MockStorage({key: 'true'}))

    return expect(
      source({method: 'OBSERVE', path: 'key'}).pipe(take(1)).toPromise()
    ).resolves.toBe(true)
  })

  test('reads bad JSON value as null', () => {
    const source = storage(new MockStorage({key: '!!!!'}))

    return expect(
      source({method: 'OBSERVE', path: 'key'}).pipe(take(1)).toPromise()
    ).resolves.toBe(null)
  })

  test('writes undefined as empty string', () => {
    const mockStorage = new MockStorage({})
    const source = storage(mockStorage)
    source({method: 'SET', path: 'key', params: {}})
    return expect(mockStorage.values.key).toBe('')
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

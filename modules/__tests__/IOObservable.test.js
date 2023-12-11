import {IOObservable} from '../IOObservable'
import {Observable, of, from, Subject, BehaviorSubject} from 'rxjs'

describe('IOObservable', () => {
  test('sync value', async () => {
    const source = () => of(1)
    const o = new IOObservable(source, {}, {})
    const next = jest.fn()
    o.subscribe(next)
    expect(next).toHaveBeenCalledWith(1)
    await expect(o).resolves.toBe(1)
  })

  test('async value', async () => {
    const subject = new Subject()
    const source = () => subject
    const o = new IOObservable(source, {}, {})
    const next = jest.fn()
    o.subscribe(next)
    expect(next).not.toHaveBeenCalled()
    subject.next(1)
    expect(next).toHaveBeenCalledWith(1)
    await expect(o).resolves.toBe(1)
  })

  test('sync error', async () => {
    const source = () =>
      new Observable(() => {
        throw new Error('YOLO')
      })
    const o = new IOObservable(source, {}, {})
    const error = jest.fn()
    o.subscribe({next() {}, error}).unsubscribe()
    expect(error).toHaveBeenCalled()
    await expect(o).rejects.toThrow('YOLO')
  })

  test('async error', async () => {
    const subject = new Subject()
    const source = () => subject
    const o = new IOObservable(source, {}, {})
    const error = jest.fn()
    o.subscribe({next() {}, error})
    expect(error).not.toHaveBeenCalled()
    subject.error(new Error('YOLO'))
    expect(error).toHaveBeenCalled()
    await expect(o).rejects.toThrow('YOLO')
  })

  test('does not pass on complete', () => {
    const source = () => of(1)
    const o = new IOObservable(source, {}, {})
    const complete = jest.fn()
    o.subscribe(
      () => {},
      () => {},
      complete
    ).unsubscribe()
    expect(complete).not.toHaveBeenCalled()
  })

  test('does not pass on identical values (like distinctUntilChanged)', () => {
    const source = () => from([1, 1])
    const o = new IOObservable(source, {}, {})
    const next = jest.fn()
    o.subscribe(next).unsubscribe()
    expect(next).toHaveBeenCalledTimes(1)
  })

  test('shares a single subscription (like refCount)', () => {
    let subscribed = 0
    let unsubscribed = 0
    const source = () =>
      new Observable(() => {
        subscribed++
        return () => {
          unsubscribed++
        }
      })
    const o = new IOObservable(source, {}, {})
    const subscription1 = o.subscribe()
    o.subscribe().unsubscribe()
    subscription1.unsubscribe()
    expect(subscribed).toBe(1)
    expect(unsubscribed).toBe(1)
  })

  test('passes on latest value to subsequent subscribers (like ReplaySubject(1))', () => {
    const subject = new Subject()
    const source = () => subject
    const o = new IOObservable(source, {}, {})
    const subscription1 = o.subscribe()
    subject.next(1)
    subject.next(2)
    const next = jest.fn()
    o.subscribe(next).unsubscribe()
    subscription1.unsubscribe()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(2)
  })

  test('handles nested updates', () => {
    const subject = new BehaviorSubject(1)
    const source = () => subject
    const o = new IOObservable(source, {}, {})
    const values1 = []
    const values2 = []
    // We are using two subscriptions to test last value.
    // First subscription should set last value.
    o.subscribe((value) => {
      values1.push(value)
    })
    // Second subscription should receive last value and set new value.
    o.subscribe((value) => {
      values2.push(value)
      if (value === 1) subject.next(2)
    })
    // Both values should be the same.
    expect(values1).toEqual([1, 2])
    expect(values2).toEqual([1, 2])
  })

  test('sync value with Promise.then', async () => {
    const subject = new BehaviorSubject(1)
    const source = () => subject
    const o = new IOObservable(source, {}, {})
    await expect(o.then((v) => v)).resolves.toBe(1)
    expect(subject.observed).toBe(false)
  })

  test('async value with Promise.then', async () => {
    const subject = new Subject()
    const source = () => subject
    const o = new IOObservable(source, {}, {})
    const promise = o.then((v) => v)
    subject.next(1)
    await expect(promise).resolves.toBe(1)
    expect(subject.observed).toBe(false)
  })

  test('errors handled with Promise.then', async () => {
    const source = () =>
      new Observable(() => {
        throw new Error('YOLO')
      })
    const o = new IOObservable(source, {}, {})
    const handler = jest.fn(() => 1)
    await expect(o.then(() => {}, handler)).resolves.toBe(1)
    expect(handler).toHaveBeenCalledWith(expect.any(Error))
  })

  test('errors handled with Promise.catch', async () => {
    const source = () =>
      new Observable(() => {
        throw new Error('YOLO')
      })
    const o = new IOObservable(source, {}, {})
    const handler = jest.fn(() => 1)
    await expect(o.catch(handler)).resolves.toBe(1)
    expect(handler).toHaveBeenCalledWith(expect.any(Error))
  })
})

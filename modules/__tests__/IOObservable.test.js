import {IOObservable} from '../IOObservable'
import {Observable, of, from, throwError, Subject, BehaviorSubject} from 'rxjs'

describe('IOObservable', () => {
  test('passes on value', () => {
    const o = new IOObservable(of(1))
    const next = jest.fn()
    o.subscribe(next).unsubscribe()
    expect(next).toHaveBeenCalledWith(1)
  })

  test('passes on error', () => {
    const o = new IOObservable(throwError(new Error('YOLO')))
    const error = jest.fn()
    o.subscribe(() => {}, error).unsubscribe()
    expect(error).toHaveBeenCalled()
  })

  test('does not pass on complete', () => {
    const o = new IOObservable(of(1))
    const complete = jest.fn()
    o.subscribe(
      () => {},
      () => {},
      complete
    ).unsubscribe()
    expect(complete).not.toHaveBeenCalled()
  })

  test('does not pass on identical values (like distinctUntilChanged)', () => {
    const o = new IOObservable(from([1, 1]))
    const next = jest.fn()
    o.subscribe(next).unsubscribe()
    expect(next).toHaveBeenCalledTimes(1)
  })

  test('shares a single subscription (like refCount)', () => {
    let subscribed = 0
    let unsubscribed = 0
    const o = new IOObservable(
      Observable.create(() => {
        subscribed++
        return () => {
          unsubscribed++
        }
      })
    )
    const subscription1 = o.subscribe()
    o.subscribe().unsubscribe()
    subscription1.unsubscribe()
    expect(subscribed).toBe(1)
    expect(unsubscribed).toBe(1)
  })

  test('passes on latest value to subsequent subscribers (like ReplaySubject(1))', () => {
    const subject = new Subject()
    const o = new IOObservable(subject)
    const subscription1 = o.subscribe()
    subject.next(1)
    subject.next(2)
    const next = jest.fn()
    o.subscribe(next).unsubscribe()
    subscription1.unsubscribe()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(2)
  })

  test('avoids unsubscribing inner subscription when cleanCache function passed', () => {
    let subscribed = 0
    let unsubscribed = 0
    let cleanCache = jest.fn()
    const o = new IOObservable(
      Observable.create(() => {
        subscribed++
        return () => {
          unsubscribed++
        }
      }),
      cleanCache
    )
    o.subscribe().unsubscribe()
    expect(subscribed).toBe(1)
    expect(unsubscribed).toBe(0)
    expect(cleanCache).toHaveBeenCalledTimes(1)
    o.disconnect()
    expect(unsubscribed).toBe(1)
  })

  test('handles nested updates', () => {
    const subject = new BehaviorSubject(1)
    const o = new IOObservable(subject)
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
})

import {IOObservable} from '../IOObservable'
import Rx from 'rxjs'

describe('IOObservable', () => {
  test('passes on value', () => {
    const o = new IOObservable(Rx.Observable.of(1))
    const next = jest.fn()
    o.subscribe(next).unsubscribe()
    expect(next).toHaveBeenCalledWith(1)
  })

  test('passes on error', () => {
    const o = new IOObservable(Rx.Observable.throw(new Error('YOLO')))
    const error = jest.fn()
    o.subscribe(() => {}, error).unsubscribe()
    expect(error).toHaveBeenCalled()
  })

  test('does not pass on complete', () => {
    const o = new IOObservable(Rx.Observable.of(1))
    const complete = jest.fn()
    o.subscribe(() => {}, () => {}, complete).unsubscribe()
    expect(complete).not.toHaveBeenCalled()
  })

  test('does not pass on identical values (like distinctUntilChanged)', () => {
    const o = new IOObservable(Rx.Observable.from([1, 1]))
    const next = jest.fn()
    o.subscribe(next).unsubscribe()
    expect(next).toHaveBeenCalledTimes(1)
  })

  test('shares a single subscription (like refCount)', () => {
    let subscribed = 0
    let unsubscribed = 0
    const o = new IOObservable(
      Rx.Observable.create(() => {
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
    const subject = new Rx.Subject()
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
      Rx.Observable.create(() => {
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
})

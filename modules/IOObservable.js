import {Observable, Subject, Subscriber, Subscription} from 'rxjs'
import {take} from 'rxjs/operators'

export class IOObservable extends Observable {
  constructor(source, cleanCache) {
    super()
    this._source = source
    this._reset()
    // When this is available, we are in the root cache and can use it for
    // async cleanup.
    this.cleanCache = cleanCache
  }

  _reset() {
    this._refCount = 0
    this._subject = null
    this._connection = null
    this._hasValue = false
    this._value = null
  }

  _subscribe(subscriber) {
    this._refCount++

    const externalSubscriber = new ExternalSubscriber(subscriber, this)
    const subscription = this.getSubject().subscribe(externalSubscriber)

    // After subscribing to our subject, we pass the last value if available.
    if (this._hasValue) {
      subscriber.next(this._value)
    }

    if (!externalSubscriber.closed && !this._connection) {
      this._connection = new Subscription()
      this._connection.add(
        this._source.subscribe(new InternalSubscriber(this.getSubject(), this))
      )
    }

    return subscription
  }

  getSubject() {
    if (!this._subject || this._subject.isStopped) {
      this._subject = new Subject()
    }
    return this._subject
  }

  disconnect() {
    const {_connection, cleanCache} = this

    this._reset()

    if (_connection) _connection.unsubscribe()

    if (cleanCache) cleanCache()
  }

  disconnectAsync() {
    if (this.cleanCache) this.cleanCache()
    else this.disconnect()
  }

  // When used as a promise, we only want the first value.
  toPromise() {
    return this.pipe(take(1)).toPromise()
  }

  // Allow use as promise.
  then(onFulfilled, onRejected) {
    return this.toPromise().then(onFulfilled, onRejected)
  }

  // Allow use as promise.
  catch(onRejected) {
    return this.toPromise().catch(onRejected)
  }
}

class InternalSubscriber extends Subscriber {
  constructor(destination, observable) {
    super(destination)
    this.observable = observable
  }

  _error(error) {
    this._unsubscribe()
    super._error(error)
  }

  // Never pass on complete.
  _complete() {}

  _next(value) {
    const {observable} = this
    let identical = false

    if (observable._hasValue) {
      identical = observable._value === value
    } else {
      observable._hasValue = true
    }

    if (identical === false) {
      observable._value = value
      super._next(value)
    }
  }

  _unsubscribe() {
    const {observable} = this
    if (observable) {
      this.observable = null
      observable.disconnect()
    }
  }
}

class ExternalSubscriber extends Subscriber {
  constructor(destination, observable) {
    super(destination)
    this.observable = observable
  }

  _unsubscribe() {
    const {observable} = this

    this.observable = null

    const {_refCount} = observable

    if (_refCount >= 1) observable._refCount--
    if (_refCount <= 1) observable.disconnectAsync()
  }
}

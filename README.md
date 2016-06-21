# react-io
Request API using URLs
Request and mutate data using a standard interface.

## io(url)
The standard interface to read and mutate data.

Returns an object that represents data at a given URL.

It can be consumed as both an [Observable](https://github.com/zenparsing/es-observable) (with .subscribe) and a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) (with .next).

A URL is a string starting with a forward slash e.g. '/user'

It is possible to read and mutate data at multiple URLs in the same request.
```javascript
io('/user').next(auth => {})
io(['/user', '/auth']).next(([user, auth]) => {})
io({user: '/user', auth: '/auth'}).next(({user, auth}) => {})
```

## io(url).request(request)
Send request to endpoint. Assumed to be a mutation.
Returns a promise.

```javascript
io('/user').request({
  method: 'UPDATE',
  value: {
    name: 'Liam'
  }
})
```

# react-io
Request API using URLs
Request and mutate data using a standard interface.

## io(path, [method], [params])
The standard interface to read and mutate data.

Returns an object that represents data at a given URL.

It can be consumed as both an [Observable](https://github.com/zenparsing/es-observable) (with .subscribe) and a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) (with .next).

A path is a string starting with a forward slash e.g. '/user'

```javascript
io('/user').next(auth => {})
io('/user').subscribe(auth => {})
io('/user', 'SIGN_OUT')
io('/user', 'SIGN_IN', {id, pass})
```

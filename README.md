# url-io
Request API using URLs.
Request and mutate data using a standard interface.

## io(path, [method], [params])
The primary function for reading and mutating data.

The only required argument is a path. A path is a string starting with a forward slash e.g. '/user'.
If method is not provided, it defaults to OBSERVE.

```javascript
// Request data from /user:
io('/user')
// The same request with explicit defaults:
io('/user', 'OBSERVE', {})
```

OBSERVE requests return an object that can be consumed as both an [Observable](https://github.com/tc39/proposal-observable) (with .subscribe) and a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) (with .then). url-io uses [RxJS 5](https://github.com/ReactiveX/rxjs) for Observables.
OBSERVE requests are lazy so data will not be fetched until then or subscribe methods are called.

```javascript
// To get data as Promise:
io('/user').then((user) => {})
// To subscribe to data as Observable:
io('/user').subscribe((user) => {})
```

All methods other than OBSERVE are considered mutations and are executed immediately, returning a Promise.

```javascript
// Call sign out on user:
io('/user', 'SIGN_OUT')
// Call sign in on user, passing id and pass as params:
io('/user', 'SIGN_IN', {id, pass})
```

io must be created using createIO.

## createIO(source)
Creates an io function from a source. This allows the shorthand syntax described above and caches observables.

### source
Function that accepts a request object and returns an Observable for OBSERVE methods or a Promise for other methods.

### request
Arguments given to io() are transformed into a standard request object. Sources can expect to receive an object with these keys.

```
{
  io, // Allows recursion.
  originalPath, // Path as given to original io call.
  path, // Relative path (root slash is removed). Example: 'user/1'.
  method, // Example 'OBSERVE'.
  params, // Object containing data outside of path. For POST body or search params.
}
```

### io with simple echo source
```javascript
import {createIO} from 'url-io'
import {of} from 'rxjs/observable/of'

const io = createIO((request) => {
  const {method} = request

  return method === 'OBSERVE' ? of(request) : Promise.resolve(request)
})

io('/a', {b: 'b'}).subscribe((result) => {
  // {io, originalPath: '/a', path: 'a', method: 'OBSERVE', params: {b: 'b'}}
})

io('/a', 'TEST', {b: 'b'}).then((result) => {
  // {io, originalPath: '/a', path: 'a', method: 'TEST', params: {b: 'b'}}
})
```

## methods(methodMap)
Splits request among sources by method.
Fallback source can be specified with the "default" key.

```javascript
import {methods} from 'url-io'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'

const val = new BehaviorSubject(1)

const source = methods({
  OBSERVE: () => val,
  INCREMENT: () => Promise.resolve(val.next(val.getValue() + 1)),
  // Default source (not required).
  default: () => Promise.reject(new Error('Unknown method')),
})
```

## paths(pathsMap)
Splits request among sources by path.

Paths must be specified with leading slash ("/").

Only the path up to the next slash is used so paths cannot contain any slashes after the first.

Matching path piece is removed from request path before it is passed to the matching source.

A single wildcard path source can be specified with a key like "/:token" where token is request object key that will be populated with the path piece (careful not to overwrite existing keys).

```javascript
import {paths} from 'url-io'
import {of} from 'rxjs/observable/of'

const source = paths({
  // / -> "root"
  '/': () => of('root'),
  // /static -> "static"
  '/static': () => of('static'),
  // /other -> "dynamic: other"
  '/:dynamic': ({dynamic}) => of('dynamic: ' + dynamic),
})
```

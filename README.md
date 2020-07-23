# url-io

Read and mutate data using a standard interface.

```javascript
import {createIO, routes} from 'url-io'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'

const user$ = new BehaviorSubject({})

const io = createIO(
  routes({
    '/user': {
      OBSERVE: () => user$,
      SIGN_OUT: () => {
        user$.next({})
      },
      SIGN_IN: ({params: {id, password}}) => {
        // fetch(...).then((user) => { user$.next(user) })
      },
    },
  })
)

// Read user value as Promise:
io('/user').then((user) => {})
// Subscribe to user data as Observable:
io('/user').subscribe((user) => {})
// Call sign out method on user:
io('/user', 'SIGN_OUT').then(() => {})
// Call sign in method on user, passing id and password as params:
io('/user', 'SIGN_IN', {id, password}).then(() => {})
```

[React bindings](https://github.com/liamcmitchell/react-io)

- [url-io](#url-io)
  - [`io()`](#io)
  - [`createIO()`](#createio)
  - [Source](#source)
  - [Request](#request)
  - [Higher-order sources](#higher-order-sources)
  - [Sources](#sources)
    - [`methods()`](#methods)
    - [`paths()`](#paths)
    - [`routes()`](#routes)
    - [`rejectNotFound`](#rejectnotfound)

## `io()`

```javascript
io(
  path: string, // Starting with a forward slash e.g. '/user'
  method?: string, // Uppercase string, defaults to OBSERVE
  params?: Object // For things like query params or request body, defaults to empty object
): Promise | Observable
```

OBSERVE (read) requests can be consumed as a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) (with .then) or an [Observable](https://github.com/tc39/proposal-observable) (with .subscribe, extends [RxJS 5](https://github.com/ReactiveX/rxjs) Observable).
OBSERVE requests are lazy so data will not be fetched until then or subscribe methods are called.

All other methods are considered mutations and are executed immediately, returning a Promise.

An io function should be created using createIO.

## `createIO()`

Creates an io function from a source. This allows the shorthand syntax described above and caches observables.

```javascript
createIO(source: Source): Function
```

```javascript
import {createIO} from 'url-io'

const io = createIO((request) => request)

io('/a', {b: 'b'}).subscribe((result) => {
  // {io, originalPath: '/a', path: 'a', method: 'OBSERVE', params: {b: 'b'}}
})

io('/a', 'TEST', {b: 'b'}).then((result) => {
  // {io, originalPath: '/a', path: 'a', method: 'TEST', params: {b: 'b'}}
})
```

## Source

Function that accepts a Request and returns an Observable (for OBSERVE methods) or a Promise.

```javascript
Source: (request: Request) => Promise | Observable
```

All url-io functions that accept a source will convert return values to an Observable or Promise.

## Request

Arguments given to io() are transformed into a standard request object. Sources can expect to receive an object with these keys:

```
{
  io: Function, // Allows recursion.
  originalPath: string, // Path as given to original io call.
  path: string, // Relative path (root slash is removed). Example: 'user/1'.
  method: string, // Example: 'OBSERVE'.
  params: Object, // For things like POST body or search params.
}
```

## Higher-order sources

## Sources

### `methods()`

Splits request among sources by method.
Fallback source can be specified with the "default" key.

```javascript
methods(methods: Object): Source
```

```javascript
import {methods} from 'url-io'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'

const val = new BehaviorSubject(1)

const source = methods({
  OBSERVE: () => val,
  INCREMENT: () => val.next(val.getValue() + 1),
})
```

### `paths()`

Splits request among sources by path.

```javascript
paths(paths: Object): Source
```

Paths must be specified with leading slash ("/").

Only the path up to the next slash is used so paths cannot contain any slashes after the first.

Matching path piece is removed from request path before it is passed to the matching source.

A single wildcard path source can be specified with a key like "/:token" where token is request object key that will be populated with the path piece (careful not to overwrite existing keys).

```javascript
import {paths} from 'url-io'

const source = paths({
  // / -> "root"
  '/': () => 'root',
  // /static -> "static"
  '/static': () => 'static',
  // /other -> "dynamic: other"
  '/:dynamic': ({dynamic}) => 'dynamic: ' + dynamic,
})
```

### `routes()`

Paths and methods in one. Allows defining nested routes.

```javascript
routes(routes: Object): Source
```

```javascript
import {routes} from 'url-io'

const echoSource = (request) => request

const source = routes({
  '/': {
    OBSERVE: echoSource,
    OTHER: echoSource,
  },
  '/:token': {
    '/': {}, // Effectively the same as rejectNotFound.
    '/details': {
      OBSERVE: echoSource,
    },
  },
})
```

### `rejectNotFound`

Rejects request with source not found error.

```javascript
rejectNotFound: Source
```

```javascript
import {paths, rejectNotFound} from 'url-io'

const source = paths({
  '/': rejectNotFound, // Prevent root requests going to token source.
  '/:token': (request) => request,
})
```

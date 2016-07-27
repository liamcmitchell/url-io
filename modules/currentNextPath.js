export default function currentNextPath(path) {
  // Make sure all paths start with /.
  path = path[0] === '/' ?
    path :
    '/' + path

  const nextIndex = path.indexOf('/', 1)

  const current = nextIndex === -1 ?
    path :
    path.slice(0, nextIndex)

  const next = nextIndex === -1 ?
    '' :
    path.slice(nextIndex)

  return [current, next]
}

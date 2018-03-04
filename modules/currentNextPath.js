export function currentNextPath(path) {
  const nextIndex = path.indexOf('/')

  if (nextIndex === -1) {
    return [path, '']
  }

  return [path.slice(0, nextIndex), path.slice(nextIndex + 1)]
}

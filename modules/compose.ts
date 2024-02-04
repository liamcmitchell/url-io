import {Source} from './source'

type HigherOrderSource = (source: Source) => Source

export const compose = (...funcs: HigherOrderSource[]): HigherOrderSource => {
  return funcs.reduce((a, b) => (arg) => a(b(arg)))
}

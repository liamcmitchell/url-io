import {createSafeSource} from './source'

export const mapRequest = (mapper) => (source) => {
  return createSafeSource((request) => source(mapper(request)))
}

import {Request} from './request'
import {Source, createSafeSource} from './source'

export const mapRequest =
  (mapper: (request: Request) => Request) => (source: Source) => {
    return createSafeSource((request) => source(mapper(request)))
  }

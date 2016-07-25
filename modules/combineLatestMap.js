import zipObject from 'lodash/zipObject'
import keys from 'lodash/keys'
import values from 'lodash/values'
import {combineLatest} from 'rxjs/observable/combineLatest'
import {map} from 'rxjs/operator/map'

export default function combineLatestMap(object) {
  return combineLatest(values(object))
    ::map(values => zipObject(keys(object), values))
}

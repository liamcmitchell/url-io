import {methods} from './method'
import {Observable} from 'rxjs/Observable'
import pick from 'lodash/pick'

const allowedOptions = ['enableHighAccuracy', 'maximumAge', 'timeout']

// Produces an object that may contain a position or error property.
export const geolocation = methods({
  OBSERVE: ({params}) =>
    Observable.create((observer) => {
      if (!navigator.geolocation) {
        observer.next({
          error: new Error('Browser does not support geolocation'),
        })
        return
      }

      const success = (position) => observer.next({position})
      const error = (error) => observer.next({error})
      const options = pick(params, allowedOptions)

      const watchId = navigator.geolocation.watchPosition(
        success,
        error,
        options
      )

      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    }),
})

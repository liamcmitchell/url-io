import {routes} from './routes'
import {Observable} from 'rxjs'

// Produces an object that may contain a position or error property.
export const geolocation = routes({
  OBSERVE: ({params: {enableHighAccuracy, maximumAge, timeout}}) =>
    new Observable((observer) => {
      if (!navigator.geolocation) {
        observer.next({
          error: new Error('Browser does not support geolocation'),
        })
        return
      }

      const success: PositionCallback = (position) => observer.next({position})
      const error: PositionErrorCallback = (error) => observer.next({error})

      const watchId = navigator.geolocation.watchPosition(success, error, {
        enableHighAccuracy,
        maximumAge,
        timeout,
      } as PositionOptions)

      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    }),
})

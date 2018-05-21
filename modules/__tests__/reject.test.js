import {reject} from '../reject'

describe('reject', () => {
  test('throws if no error provided', () => {
    expect(() => reject({method: 'OTHER'})).toThrow()
  })

  test('returns rejected promise for non-OBSERVE request', () => {
    expect(reject({method: 'OTHER'}, new Error('YOLO'))).rejects.toThrow()
  })

  test('returns thow observable for OBSERVE request', () => {
    expect(
      reject({method: 'OBSERVE'}, new Error('YOLO')).toPromise()
    ).rejects.toThrow()
  })

  // Deprecated.
  test('accepts error string', () => {
    expect(reject({method: 'OTHER'}, 'YOLO')).rejects.toThrow()
  })
})

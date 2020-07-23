import {
  isSource,
  ensureSource,
  isSafeSource,
  markSafeSource,
  createSafeSource,
  tryCatch,
} from '../source'
import {of} from 'rxjs'

describe('isSource', () => {
  test('returns true for a function', () => {
    expect(isSource(() => {})).toBe(true)
    expect(isSource()).toBe(false)
  })
})

describe('ensureSource', () => {
  test('throws if source is not a function', () => {
    expect(ensureSource(() => {})).toBeUndefined()
    expect(() => ensureSource()).toThrow('function')
    expect(() => ensureSource(null, 'name')).toThrow('name')
  })
})

describe('markSafeSource', () => {
  test('returns given function marked as safe', () => {
    const source = () => {}
    const safeSource = markSafeSource(source)
    expect(safeSource).toBe(source)
    expect(source.safe).toBe(true)
  })
})

describe('isSafeSource', () => {
  test('returns true for source marked as safe', () => {
    const manualSafeSource = () => {}
    manualSafeSource.safe = true
    expect(isSafeSource(manualSafeSource)).toBe(true)
    expect(isSafeSource(markSafeSource(() => {}))).toBe(true)
  })
})

describe('createSafeSource', () => {
  test('throws if source is not a function', () => {
    expect(() => createSafeSource()).toThrow('function')
  })

  test('returns safe source', () => {
    expect(isSafeSource(createSafeSource(() => {}))).toBe(true)
  })

  test('safeSource returns observable error when source throws', () => {
    const source = createSafeSource(() => {
      throw new Error('Oops')
    })
    expect(source({method: 'OBSERVE'}).toPromise()).rejects.toThrow('Oops')
  })

  test('safeSource returns observable error when source returns undefined', () => {
    const source = createSafeSource(() => {})
    expect(source({method: 'OBSERVE'}).toPromise()).rejects.toThrow('undefined')
  })

  test('safeSource returns original observable from source', () => {
    const trueObservable = of(true)
    const source = createSafeSource(() => trueObservable)
    expect(source({method: 'OBSERVE'})).toBe(trueObservable)
  })

  test('safeSource returns observable when source returns other than undefined or observable', () => {
    const source = createSafeSource(() => true)
    expect(source({method: 'OBSERVE'}).toPromise()).resolves.toBe(true)
  })

  test('safeSource returns promise error when source throws', () => {
    const source = createSafeSource(() => {
      throw new Error('Oops')
    })
    expect(source({method: 'OTHER'})).rejects.toThrow('Oops')
  })

  test('safeSource returns original promise from source', () => {
    const truePromise = Promise.resolve(true)
    const source = createSafeSource(() => truePromise)
    expect(source({method: 'OTHER'})).toBe(truePromise)
  })

  test('safeSource returns resolved promise value when consumed as an observable', async () => {
    const source = createSafeSource(() => Promise.resolve(true))
    let value
    source({method: 'OBSERVE'}).subscribe((v) => {
      value = v
    })

    await 1

    expect(value).toBe(true)
  })

  test('safeSource returns promise when source returns other than promise', () => {
    const source = createSafeSource(() => true)
    expect(source({method: 'OTHER'})).resolves.toBe(true)
  })
})

describe('tryCatch', () => {
  test('returns createSafeSource', () => {
    expect(tryCatch()).toBe(createSafeSource)
  })
})

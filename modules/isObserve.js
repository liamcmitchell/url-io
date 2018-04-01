const observe = 'OBSERVE'

export const isObserve = (requestOrMethod) =>
  requestOrMethod === observe || requestOrMethod.method === observe

/* eslint no-console: off */
import Benchmark from 'benchmark'
import {never} from 'rxjs/observable/never'

import * as urlIO from './modules'
// import * as urlIO2 from './modules2'

const variants = {
  warmOriginal: urlIO,
  original: urlIO,
  // warmModified: urlIO2,
  // modified: urlIO2,
}

const suite = new Benchmark.Suite()

for (const [name, {createIO}] of Object.entries(variants)) {
  const io = createIO(() => never())
  const noop = () => {}
  let i = 0
  suite.add(`${name} never`, () => {
    io('/path' + i++ % 20)
      .subscribe(noop)
      .unsubscribe()
  })
}

suite
  .on('error', console.error.bind(console))
  .on('cycle', (event) => {
    const result = String(event.target)
    if (!result.startsWith('warm')) console.log(result)
  })
  .run()

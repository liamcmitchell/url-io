/* eslint no-console: off */
import Benchmark from 'benchmark'
import {NEVER} from 'rxjs'

import * as urlIO from './dist/url-io.cjs'

const variants = {
  original: urlIO,
}

const suite = new Benchmark.Suite()

for (const [name, {createIO}] of Object.entries(variants)) {
  const io = createIO(() => NEVER)
  const noop = () => {}
  let i = 0
  suite.add(`${name} never`, () => {
    io('/path' + (i++ % 20))
      .subscribe(noop)
      .unsubscribe()
  })
}

suite
  .on('error', console.error.bind(console))
  .on('cycle', (event) => {
    console.log(String(event.target))
  })
  .run()

// Consumer API
export createIO from './createIO'

// Source creation
// Returns source.
export routes from '././routes'
export methods from '././methods'
export alias from './alias'
export json from './json'
export memory from './memory'

// Source wrapping
// Takes in a source, returns new source with extra functionality.
export wrapCache from './wrapCache'
export wrapMultipleUrls from './wrapMultipleUrls'
export wrapNesting from './wrapNesting'
export wrapRecursion from './wrapRecursion'
export wrapStandardRequest from './wrapStandardRequest'

// Standard combo of wrappers
export wrapStandard from './wrapStandard'

// Helpers
export url from './url'

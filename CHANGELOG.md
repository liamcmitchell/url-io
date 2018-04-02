# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 4.4.0 - 2018-04-03

### Added

* currentPath
* nextPath
* routes
* branchPaths
* branchMethods
* createSafeSource
* markSafeSource

### Changed

* Observe results are wrapped in Rx.Observable.of() (if not undefined or observable).
* Non-observe responses are wrapped in Promise.resolve().

### Deprecated

* currentNextPath
* tryCatch

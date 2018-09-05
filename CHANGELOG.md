# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 5.0.0 - 2018-09-05

### Changed

* Upgraded to RxJS 6.

## 4.5.2 - 2018-07-05

### Fixed

* Fixed case where location was emitted before subscription

## 4.5.1 - 2018-06-22

### Fixed

* Fixed case where last value was emitted before subscription

## 4.5.0 - 2018-05-22

### Fixed

* bridgeNonReactiveSource caches on creation, not result

### Changed

* Rewrote createIO and root cache.

### Deprecated

* cache
* reject error passed as string

## 4.4.1 - 2018-04-07

### Fixed

* Routes behavior now matches paths & methods

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

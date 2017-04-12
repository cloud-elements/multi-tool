## v0.5.0 <sub><sup>(2017-04-12)</sup></sub>
* Updated left-sided return to be `Either(Error)` instead of `Either(String)`
* Move from `npm` to `yarn`

## v0.4.2 <sub><sup>(2017-04-07)</sup></sub>
* Update locks to use files with updated mtime

## v0.4.1 <sub><sup>(2017-04-04)</sup></sub>
* Fix memory leak

## v0.4.0 <sub><sup>(2017-03-29)</sup></sub>
* Fix concurrency issues
* Return [Sanctuary](https://github.com/sanctuary-js/sanctuary) `Either`

## v0.3.2 <sub><sup>(2017-03-22)</sup></sub>
* Fix mode upon directory and file creation

## v0.3.1 <sub><sup>(2017-03-06)</sup></sub>
* Fix not installed packages being passed to invalidators

## v0.3.0 <sub><sup>(2017-03-06)</sup></sub>
* Add custom invalidators
* Update `modules.export` to export partially applied install with `path` and `invalidator`

## v0.2.1 <sub><sup>(2017-02-07)</sup></sub>
* Fix installation failures using `latest` version
* Add explicit support for scoped packages

## v0.2.0 <sub><sup>(2017-02-07)</sup></sub>
* Add strict checking of package name and version
* Add exported `validName` function
* Add exported `validVersion` function

## v0.1.0 <sub><sup>(2017-02-07)</sup></sub>
* Update errors to return empty String instead of null

## v0.0.1 <sub><sup>(2017-02-06)</sup></sub>
* Fix missing await on rmdir upon error

## v0.0.0 <sub><sup>(2017-02-06)</sup></sub>
* Initial release

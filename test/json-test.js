/* Copyright (c) 2012-2013 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT +no-false-attribs License <https://github.com/rvagg/node-levelup/blob/master/LICENSE>
 */

var buster  = require('buster')
  , assert  = buster.assert
  , levelup = require('../lib/levelup.js')
  , async   = require('async')
  , common  = require('./common')

buster.testCase('JSON API', {
    'setUp': function () {
      common.commonSetUp.call(this)
      this.runTest = function (testData, assertType, done) {
        var location = common.nextLocation()
        this.cleanupDirs.push(location)
        levelup(location, { createIfMissing: true, errorIfExists: true, encoding: 'json' }, function (err, db) {
          refute(err)
          if (err) return

          this.closeableDatabases.push(db)

          async.parallel(
              testData.map(function (d) { return db.put.bind(db, d.key, d.value) })
            , function (err) {
                refute(err)

                async.forEach(
                    testData
                  , function (d, callback) {
                      db.get(d.key, function (err, value) {
                        refute(err)
                        assert[assertType](d.value, value)
                        callback()
                      })
                    }
                  , done
                )
              }
          )

        }.bind(this))
      }
    }

  , 'tearDown': common.commonTearDown

  , 'simple-object values in "json" encoding': function (done) {
      this.runTest([
            { key: '0', value: 0 }
          , { key: '1', value: 1 }
          , { key: 'string', value: 'a string' }
          , { key: 'true', value: true }
          , { key: 'false', value: false }
        ], 'same', done)
    }

  , 'simple-object keys in "json" encoding': function (done) {
      this.runTest([
            { value: '0', key: 0 }
          , { value: '1', key: 1 }
          , { value: 'string', key: 'a string' }
          , { value: 'true', key: true }
          , { value: 'false', key: false }
        ], 'same', done)
    }

  , 'complex-object values in "json" encoding': function (done) {
      this.runTest([
            { key: '0', value: {
                foo: 'bar'
              , bar: [ 1, 2, 3 ]
              , bang: { yes: true, no: false }
            }}
        ], 'equals', done)
    }

  , 'complex-object keys in "json" encoding': function (done) {
      this.runTest([
            { value: '0', key: {
                foo: 'bar'
              , bar: [ 1, 2, 3 ]
              , bang: { yes: true, no: false }
            }}
        ], 'same', done)
    }
})
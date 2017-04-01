'use strict'

var wd = require('webdriverio')
var wdcss = require('webdrivercss')
var values = require('lodash/values')
var q = require('q') // must use q as wdio uses it internally. bummer
var isObject = require('lodash/isObject')
var set = require('lodash/set')
var pify = require('pify')

var configTemplate = { // eslint-disable-line
  /**
   * @property desiredCapabilities
   * @type {array|object}
   * @description set of selenium desiredCapabilities.  we expect an array,
   * althoug
   */
  desiredCapabilities: [
    { browserName: 'chrome' },
    { browserName: 'firefox' }
  ],

  /**
   * @property testName
   * @type string
   * @description test name.  used in image prefixing for image diffs
   */
  testName: null,

  /**
   * @property [snapDefinitions]
   * @type function
   * @description POJOs describing _what_ to snap & compare. See @{link https://github.com/webdriverio/webdrivercss#example}.
   * Snap definitions are simply webdrivercss query objects.  If you don't know these
   * in advanced, see `snapDefinitionsFromWindow`.
   */
  snapDefinitions: null,

  /**
   * @property [snapDefinitionsFromWindow]
   * @type function
   * @description code to run in the browser to collect CSS selectors, if desired.
   * Side effects, like modifying DOM, is permitted.  For instance, if you want
   * images of all <div>s, you can add unique `id`s to those nodes
   */
  snapDefinitionsFromWindow: null,

  /**
   * @property url
   * @type string
   * @description url for selenium to browse to
   */
  url: null,

  /**
   * @property [webdriverio]
   * @type {object}
   */
  webdriverio: null
}

function runSingleBrowser (wdConf, pluginConfig, webjerkconfig) {
  var { testName, snapDefinitions, snapDefinitionsFromWindow, url } = pluginConfig
  if (!testName) throw new Error('missing testName')
  if (!snapDefinitions && !snapDefinitionsFromWindow) throw new Error('snapDefinitions or snapDefinitionsFromWindow must be set')
  var client = wd.remote(wdConf)
  wdcss.init(client, {
    updateBaseline: !!process.env.UPDATE_BASELINE
  })
  return client
  .init()
  .url(url)
  .execute(snapDefinitionsFromWindow || function noop () {}, '<msg>')
  .then(function ({ value }) {
    var snapDefs = snapDefinitionsFromWindow ? value : snapDefinitions
    var runName = `${testName}-${wdConf.desiredCapabilities.browserName}`
    if (!snapDefs) throw new Error('no snapDefinitions were found')
    var css = pify(client.webdrivercss).bind(client)
    return q.resolve(css(runName, snapDefs))
    .then(function verifySnaps (res) {
      var failed = values(res).map(res => res[0]).filter(report => !report.isExactSameImage)
      if (!failed.length) return
      var failedMsg = failed.map(failed => ({
        message: failed.message,
        diffPath: failed.diffPath
      }))
      throw new Error(JSON.stringify(failedMsg, null, 2))
    })
    .then(() => client.end())
    .catch(err => client.end().then(() => { throw err }))
  })
}

module.exports = function registerSnaps () {
  return {
    name: 'snaps',
    main (pluginConfig, webjerkconfig) {
      var capabilities = pluginConfig.desiredCapabilities || [{ browserName: 'chrome' }]
      if (!Array.isArray(capabilities)) capabilities = [capabilities]
      return capabilities.reduce((chain, capability) => {
        return chain.then(() => {
          var wdConf = pluginConfig.webdriverio || {}
          if (!isObject(capability)) throw new Error('desiredCapabilities must be an object')
          set(wdConf, 'desiredCapabilities', capability)
          if (!wdConf.desiredCapabilities.browserName) throw new Error('browserName missing')
          console.log(`booting ${wdConf.desiredCapabilities.browserName}`)
          return runSingleBrowser(wdConf, pluginConfig, webjerkconfig)
        })
      }, Promise.resolve())
    }
  }
}

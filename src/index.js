'use strict'

var wd = require('webdriverio')
var wdiosc = require('wdio-screenshot')
var pify = require('pify')
var isObject = require('lodash/isObject')
var set = require('lodash/set')
var mkdirp = pify(require('mkdirp'))
var path = require('path')
var Differ = require('webjerk-image-set-diff')

/**
 * @module webjerk-snaps
 * @description website visual regression testing plugin.  on `main`,
 * webjerk-snaps queues up browsers to be run serially. each browser is
 * launched, screenshots captured. on `post`, the image directories are sent to
 * `webjerk-image-set-diff` for executing the comparison algorithm.
 */
module.exports = function registerSnaps () {
  return {
    name: 'snaps',
    /**
     * launches a browser and captures screenshots
     * @param {*} webdriverioConf
     * @param {*} pluginConfig
     * @param {*} webjerkconfig
     * @returns {Promise}
     */
    capture (webdriverioConf, pluginConfig, webjerkconfig) {
      var { testName, snapDefinitions, snapDefinitionsFromWindow, url } = pluginConfig
      if (!testName) throw new Error('missing testName')
      if (!snapDefinitions && !snapDefinitionsFromWindow) throw new Error('snapDefinitions or snapDefinitionsFromWindow must be set')
      var client = wd.remote(webdriverioConf)
      wdiosc.init(client)
      return client
      .init()
      .url(url)
      .execute(snapDefinitionsFromWindow || function noop () {}, '<msg>')
      .then(function ({ value }) {
        var browser = `${webdriverioConf.desiredCapabilities.browserName}-${webdriverioConf.desiredCapabilities.version || 'latest'}`
        var snapDefs = snapDefinitionsFromWindow ? value : snapDefinitions
        if (!snapDefs) throw new Error('no snapDefinitions were found')
        var snapRoot = path.resolve(process.cwd(), 'snaps')
        var snapRunRoot = path.resolve(snapRoot, 'runs')
        var snapRefRoot = path.resolve(snapRoot, 'ref')
        var snapRunDir = path.resolve(snapRunRoot, `run-${Date.now().toString()}`)
        return Promise.resolve()
        .then(() => Promise.all([mkdirp(snapRunDir), mkdirp(snapRefRoot)]))
        .then(() => {
          return snapDefs.reduce((client, sd) => {
            var snapFilename = path.join(snapRunDir, `${browser}-${sd.name}.png`)
            return client.saveElementScreenshot(snapFilename, sd.elem)
          }, client)
        })
        .then(() => client.end())
        .then(() => ({ snapRefRoot, snapRunDir }))
        .catch(err => client.end().then(() => { throw err }))
      })
    },
    main (pluginConfig, webjerkconfig, results) {
      var capabilities = pluginConfig.desiredCapabilities || [{ browserName: 'chrome' }]
      if (!Array.isArray(capabilities)) capabilities = [capabilities]
      // run each capability, i.e. run each requested browser
      return capabilities.reduce((chain, capability) => {
        return chain.then(() => {
          var webdriverioConf = pluginConfig.webdriverio || {}
          if (!isObject(capability)) throw new Error('desiredCapabilities must be an object')
          set(webdriverioConf, 'desiredCapabilities', capability)
          if (!webdriverioConf.desiredCapabilities.browserName) throw new Error('browserName missing')
          console.log(`booting ${webdriverioConf.desiredCapabilities.browserName}`)
          return this.capture(webdriverioConf, pluginConfig, webjerkconfig)
        })
      }, Promise.resolve())
    },
    post (pluginConfig, webjerkconfig, results) {
      var { snapRefRoot, snapRunDir } = results.main[this.name]
      if (!snapRunDir || !snapRefRoot) throw new Error('expected snapRunDir & snapRefRoot from main results')
      return Differ.factory({ refDir: snapRefRoot, runDir: snapRunDir, report: pluginConfig.report || true }).run()
    }
  }
}

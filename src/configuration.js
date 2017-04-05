/**
 * @class configuration
 */
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
   * @description custom webdriverio configuration
   */
  webdriverio: null
}

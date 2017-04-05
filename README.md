# webjerk-snaps

![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg)

website visual regression testing.

this package:

- browses to a webpage via selenium
- screenshots targeted CSS selectors, generating PNGs
- creates a new reference image set _or_ compares the new set to a reference set
  - on comparison failure (optionally) [generates a static website highlighting the failed comparisons](https://github.com/cdaringe/webjerk-image-set-diff-reporter).  this is handy if you you want your CI to deploy the site somewhere for public viewing.

this type of testing is somtimes also called CSS testing or screenshot testing.

don't like the way this package works?  hack it!  all things `webjerk` are small and modular.  feel free to drop us an issue on GitHub with questions & comments too!

## usage

see `src/index.js` for a JSDoc-style, documented configuration API.  or drop an issue.

- to get image baselines, create a baseline config and run. see #example
- to update baseline images, i.e. approve changes, set `UPDATE_BASELINE=true` and run it again!

## example

```js
// example
'use strict'

var wj = require('webjerk')

wj.run({
  plugins: [
    {
      name: 'webjerk-snaps',
      config: {
        desiredCapabilities: [ // see webdriverio or selenium docs!
          { browserName: 'chrome' },
          { browserName: 'firefox' }
        ],
        url: 'http://localhost:3333', // what page to extract snaps from
        testName: 'screenshot-all-divs',
        snapDefinitions: [{ elem: 'div', name: 'best div' }], // OR,
        snapDefinitionsFromWindow: function queryDivSnapDefinitions (divs, message) {
          // @NOTE this JS is run in the _browser_ context
          // webdriverio JS serialziation requires semis. :/
          var divs = document.getElementsByTagName('div');
          var map = [];
          var i = 0;
          var tDiv;
          while (divs[i]) {
            tDiv = divs[i];
            if (!tDiv.id) tDiv.id = '__dummy_div_' + i;
            map.push({ elem: '#' + tDiv.id, name: tDiv.id });
            ++i;
          }
          return map;
        }
      }
    }
  ]
})
```

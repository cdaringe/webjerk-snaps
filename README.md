# webjerk-snaps

![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg)

use CSS screenshot testing in `webjerk`.  this is a thin wrapper to execute [webdrivercss](https://github.com/webdriverio/webdrivercss/).

see `src/index.js` for a JSDoc-style, documented configuration API.  or drop an issue.

## usage

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

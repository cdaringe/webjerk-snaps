/*
 * TO RUN THIS TEST, YOU MUST:
 * - BE RUNNING selenium
 * - BE RUNNING HTTPSTER ON 3333 SERVING index.html
*/
'use strict'

var wj = require('webjerk')

wj.run({
  plugins: [
    {
      register: require('../'),
      config: {
        desiredCapabilities: [ // see webdriverio or selenium docs!
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

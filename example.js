'use strict';

var svgtojsx = require('svg-to-jsx');

var svg = '<svg version="1.1"><path id="myPath" style="font-family: Verdana; margin-bottom: 10px; -webkit-transition: all; ms-transition: all;"/></svg>';

// You can use svgtojsx with old school callbacks
svgtojsx(svg, function(error, jsx) {
    // ...
});

// The returned object is a promise
svgtojsx(svg).then(function(jsx) {
    // ...
});

// Or be super progressive and use await
var jsx = await svgtojsx(svg);

console.log(jsx);

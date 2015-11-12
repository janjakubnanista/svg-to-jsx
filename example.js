'use strict';

var svgtojsx = require('svg-to-jsx');

var svg = '<svg version="1.1"><path id="myPath" style="font-family: Verdana; margin-bottom: 10px; -webkit-transition: all; ms-transition: all;"/></svg>';

svgtojsx(svg, function(error, jsx) {
    console.log(jsx);
});

// Options can be passed as a second argument
var options = { refs: { myPath: 'myRefToMyPath' } };
svgtojsx(svg, options, function(error, jsx) {
    console.log(jsx);
});

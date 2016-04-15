# svg-to-jsx

[![Build Status](https://travis-ci.org/janjakubnanista/svg-to-jsx.svg?branch=master)](https://travis-ci.org/janjakubnanista/svg-to-jsx)

Simple module that consumes SVG and spits out JSX. As simple as that.

**Hey!** If you're using `gulp` you might find [`gulp-svg-to-jsx`](https://github.com/janjakubnanista/gulp-svg-to-jsx) interesting. And if you're using `webpack` you might like [`svg-jsx-loader`](https://github.com/janjakubnanista/svg-jsx-loader) that wraps this module for use as a webpack loader.

## Installation

`svg-to-jsx` is a node module. To install you have to have Node.js and NPM installed on your machine.

	npm install svg-to-jsx

## Usage

You can either use the module in your Node.js project or via command line.

### Use as a node module

    var svgtojsx = require('svg-to-jsx');
    var svg = '<svg version="1.1"><path id="myPath" style="font-family: Verdana; margin-bottom: 10px; -webkit-transition: all; ms-transition: all;"/></svg>';

    // You can use svgtojsx with old school callbacks
    svgtojsx(svg, function(error, jsx) {
        // ...
    });

    // The returned object is a promise though, you might prefer that
    svgtojsx(svg).then(function(jsx) {
        // ...
    });

#### Options

`root` *String* In case you only want to output single SVG element you can set this to its ID.

`passProps` *Boolean* Set this to true in case you want to pass `props` to the root element.

`renderChildren` *Boolean|String* Set this to true in case you want to render *this.props.children* in the root element. If set to string value, this value is interpreted as an element ID and children are rendered into this element. If element already has some text content children are appended to the end.

`refs` *Object* In case you want to be able to access specific elements from your SVG file, you can add `refs` to them. This object's keys are IDs of elements that will be assigned `refs`, the values are the `ref` names, for example:

    {
        mySvgElement: 'refToMySvgElement'
    }

will result in element with ID `mySvgElement` to be accessible via `this.refs.refToMySvgElement`.

### Use from command line

	# To output JSX to stdout
	$ svg-to-jsx <path to an SVG file>

	# To display usage info
	$ svg-to-jsx --help
	$ svg-to-jsx -h

	# To output to file
	$ svg-to-jsx -o <path to JSX file> <path to an SVG file>

## Notes

`<use/>` tags are not allowed in JSX. The element referenced by a `<use/>` tag's `xlink:href` attribute is looked up, its `id`
is discarded, and it replaces the original `<use/>` tag.

Suppose you have an SVG file with following structure:

	<polygon id="mask-path" points="497,129 537.1,135.3 494.4,215.8"/>
    <clipPath id="mask">
        <use xlink:href="#mask-path" overflow="visible"/>
    </clipPath>
    <g id="group" clip-path="url(#mask)">
    	<!-- Group contents -->
    </g>

Then of course React won't support `<use/>` tags and you would end up unmasked `#group`. So the `<use/>` tags are replaced and you end up with following structure which is supported by React:

	<polygon id="mask-path" points="497,129 537.1,135.3 494.4,215.8"/>
    <clipPath id="mask">
    	<polygon points="497,129 537.1,135.3 494.4,215.8"/>
    </clipPath>
    <g id="group" clip-path="url(#mask)">
    	<!-- Group contents -->
    </g>

## Testing

To run unit test just execute

	npm test

# svg-to-jsx

Simple module that consumes SVG and spits out JSX. As simple as that.

**If you're using gulp** you might find [`gulp-svg-to-jsx`](https://github.com/janjakubnanista/gulp-svg-to-jsx) interesting.

## Installation

`svg-to-jsx` is a node module. To install you have to have Node.js and NPM installed on your machine.

	npm install svg-to-jsx

## Usage

You can either use the module in your Node.js project or via command line.

### Use as a node module

	var fs = require('fs');
	var svgtojsx = require('svg-to-jsx');

	var svg = fs.readFileSync('<your SVG file>');
	var options = {};

	svgtojsx(svg, function(error, jsx) {
		// jsx variable now contains your JSX string
	});

	# Options can be passed as a second argument
	svgtojsx(svg, options, function(error, jsx) {
		// jsx variable now contains your JSX string
	});

#### Options

`root` *String* In case you only want to output single SVG element you can set this to its ID.

`passProps` *Boolean* Set this to true in case you want to pass `props` to the root element.

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

## Testing

To run unit test just execute

	npm test

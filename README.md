# svg-to-jsx

Simple module that consumes SVG and spits out JSX. As simple as that.

## Installation

`svg-to-jsx` is a node module. To install you have to have Node.js and NPM installed on your machine.

	npm install svg-to-jsx
	
## Usage

You can either use the module in your Node.js project or via command line.

### Use as a node module

	var fs = require('fs');
	var svgtojsx = require('svg-to-jsx');
	
	var svg = fs.readFileSync('<your SVG file>');
	
	svgtojsx(svg, function(error, jsx) {
		// jsx variable now contains your JSX string
	});

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
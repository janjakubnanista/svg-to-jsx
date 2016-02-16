'use strict';

require('mocha');

var expect = require('expect.js');
var svgToJsx = require('../index.js');

/* global describe, context, it */
describe('svg-to-jsx', function() {
    context('basic', function() {
        it('should call passed callback function when done', function(done) {
            var input = '<svg version="1.1"><text font-family="Verdana"/></svg>';

            svgToJsx(input, function() {
                done();
            });
        });

        it('should fail with invalid SVG', function(done) {
            var input = '<svg version="1.1"><text></svg>';

            svgToJsx(input, function(error) {
                expect(error).to.not.be(null);

                done();
            });
        });

        it('should not fail with valid SVG', function(done) {
            var input = '<svg version="1.1"><text font-family="Verdana"/></svg>';

            svgToJsx(input, function(error) {
                expect(error).to.be(null);

                done();
            });
        });
    });

    context('promise', function() {
        it('should return promise that resolves', function(done) {
            var input = '<svg version="1.1"><text font-family="Verdana"/></svg>';

            svgToJsx(input).then(function() {
                done();
            });
        });

        it('should return promise that resolves with valid JSX', function(done) {
            var input = '<svg version="1.1"><text font-family="Verdana"/></svg>';

            svgToJsx(input).then(function(jsx) {
                expect(jsx).to.be('<svg version="1.1">\n\t<text fontFamily="Verdana"/>\n</svg>');

                done();
            }).done();
        });

        it('should return a promise that rejects', function(done) {
            var input = '<svg version="1.1"><text></svg>';

            svgToJsx(input).then(null, function() {
                done();
            });
        });
    });

    context('output', function() {
        it('should camelCase all attributes', function(done) {
            var input = '<svg version="1.1"><text font-family="Verdana"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<text fontFamily="Verdana"/>\n</svg>');

                done();
            });
        });

        it('should remove unsupported tags', function(done) {
            var input = '<svg version="1.1"><symbol/><madeUpTag/><path/><use/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<path/>\n</svg>');

                done();
            });
        });

        it('should remove unsupported attributes', function(done) {
            var input = '<svg version="1.1"><path invalid-attribute="1"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<path/>\n</svg>');

                done();
            });
        });

        it('should unnamespace xlink attributes', function(done) {
            var input = '<svg version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"><path xlink:href="#id"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<path xlinkHref="#id"/>\n</svg>');

                done();
            });
        });

        it('should unnamespace xml attributes', function(done) {
            var input = '<svg version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"><path xml:base="/ole"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<path xmlBase="/ole"/>\n</svg>');

                done();
            });
        });

        it('should rename class to className', function(done) {
            var input = '<svg version="1.1"><path class="path"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<path className="path"/>\n</svg>');

                done();
            });
        });

        it('should replace <use/> tags with referenced elements', function(done) {
            var input = '<svg version="1.1"><defs><path id="path" class="path"/></defs><use xlink:href="#path"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<defs>\n\t\t<path className="path" id="path"/>\n\t</defs>\n\t<path className="path"/>\n</svg>');

                done();
            });
        });

        it('should merge attributes from <use/> tags with referenced elements', function(done) {
            var input = '<svg version="1.1"><defs><path id="path" class="path"/></defs><use xlink:href="#path" x="10" y="10"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<defs>\n\t\t<path className="path" id="path"/>\n\t</defs>\n\t<path className="path" x="10" y="10"/>\n</svg>');

                done();
            });
        });

        it('should process style attribute', function(done) {
            var input = '<svg version="1.1"><path style="font-family: Verdana; margin-bottom: 10px; -webkit-transition: all; ms-transition: all;"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<path style={{"fontFamily":"Verdana","marginBottom":"10px","WebkitTransition":"all","msTransition":"all"}}/>\n</svg>');

                done();
            });
        });

        it('should allow to pick only specific element', function(done) {
            var input = '<svg version="1.1"><path style="font-family: Verdana"/><path id="root"/></svg>';

            svgToJsx(input, { root: 'root' }, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<path id="root"/>');

                done();
            });
        });

        it('should fail when options.root is specified and element cannot be found', function(done) {
            var input = '<svg version="1.1"><path style="font-family: Verdana"/><path id="root"/></svg>';

            svgToJsx(input, { root: 'unknown' }, function(error) {
                expect(error).to.have.property('message');
                expect(error.message).to.be('Cannot find root element #unknown');

                done();
            });
        });

        it('should add refs to specific elements', function(done) {
            var input = '<svg version="1.1"><path id="root"/></svg>';
            var options = { refs: { root: 'myRef' } };

            svgToJsx(input, options, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<path id="root" ref="myRef"/>\n</svg>');

                done();
            });
        });

        it('should fail when options.root is specified and element cannot be found', function(done) {
            var input = '<svg version="1.1"><path id="root"/></svg>';
            var options = { refs: { unknown: 'myRef' } };

            svgToJsx(input, options, function(error) {
                expect(error).to.have.property('message');
                expect(error.message).to.be('Cannot find element #unknown for ref myRef');

                done();
            });
        });

        it('should pass props to root tag if passProps is truthy', function(done) {
            var input = '<svg version="1.1"></svg>';
            var options = { passProps: true };

            svgToJsx(input, options, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1" {...this.props}/>');

                done();
            });
        });
    });
});

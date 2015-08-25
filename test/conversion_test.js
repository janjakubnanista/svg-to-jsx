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
            var input = '<svg version="1.1"><path invalid-attribute="1" xlink:href="#id"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<path/>\n</svg>');

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

        it('should process style attribute', function(done) {
            var input = '<svg version="1.1"><path style="font-family: Verdana; margin-bottom: 10px; -webkit-transition: all; ms-transition: all;"/></svg>';

            svgToJsx(input, function(error, result) {
                expect(error).to.be(null);
                expect(result).to.be('<svg version="1.1">\n\t<path style={{"fontFamily":"Verdana","marginBottom":"10px","WebkitTransition":"all","msTransition":"all"}}/>\n</svg>');

                done();
            });
        });
    });
});

'use strict';

require('mocha');

var expect = require('expect.js');
var utils = require('../utils.js');

/* global describe, context, it */
describe('utils', function() {
    context('cssProperty()', function() {
        it('should camelCase property name', function() {
            expect(utils.cssProperty('background-color')).to.be('backgroundColor');
        });

        it('should capitalize -webkit prefix', function() {
            expect(utils.cssProperty('-webkit-transition')).to.be('WebkitTransition');
        });

        it('should capitalize -moz prefix', function() {
            expect(utils.cssProperty('-moz-transition')).to.be('MozTransition');
        });

        it('should capitalize -o prefix', function() {
            expect(utils.cssProperty('-o-transition')).to.be('OTransition');
        });

        it('should not capitalize -ms prefix', function() {
            expect(utils.cssProperty('-ms-transition')).to.be('msTransition');
        });
    });

    context('camelCase()', function() {
        it('should camel case dashed string', function() {
            expect(utils.camelCase('dashed-string-with-hyphens')).to.be('dashedStringWithHyphens');
        });

        it('should camel case leading dash', function() {
            expect(utils.camelCase('-dashed-string-with-hyphens')).to.be('DashedStringWithHyphens');
        });
    });

    context('sanitizeAttributes()', function() {
        it('should return null if called with falsy parameter', function() {
            expect(utils.sanitizeAttributes()).to.be(null);
            expect(utils.sanitizeAttributes(null)).to.be(null);
            expect(utils.sanitizeAttributes(undefined)).to.be(null);
            expect(utils.sanitizeAttributes(false)).to.be(null);
        });

        it('should rename class to className', function() {
            expect(utils.sanitizeAttributes({ class: 'css-class' })).to.eql({ className: 'css-class' });
        });

        it('should remove unsupported attributes', function() {
            expect(utils.sanitizeAttributes({ 'invalid-attribute': 'url(#id)' })).to.eql({});
        });
    });

    context('unnamespaceAttributeName()', function() {
        it('should replace namespaced attribute names with camel cased ones', function() {
            expect(utils.unnamespaceAttributeName('xlink:href')).to.be('xlinkHref');
            expect(utils.unnamespaceAttributeName('xml:base')).to.be('xmlBase');
        });
    });
});

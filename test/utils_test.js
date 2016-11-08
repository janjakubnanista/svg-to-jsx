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

        it('should preserve data attributes', function() {
            expect(utils.sanitizeAttributes({ 'data-attribute': 'value' })).to.eql({ 'data-attribute': 'value' });
        });
    });

    context('unnamespaceAttributeName()', function() {
        it('should replace namespaced attribute names with camel cased ones', function() {
            expect(utils.unnamespaceAttributeName('xlink:href')).to.be('xlinkHref');
            expect(utils.unnamespaceAttributeName('xml:base')).to.be('xmlBase');
        });
    });

    context('supportsAllAttributes()', function() {
        it('should return true if element has a hyphen in the tagName', function() {
            expect(utils.supportsAllAttributes({ tagName: 'an-element', attributes: {} })).to.be(true);
        });

        it('should return true if element has an is attribute', function() {
            expect(utils.supportsAllAttributes({ tagName: 'div', attributes: { is: 'element' } })).to.be(true);
        });

        it('should return false if element does not have an is attribute or a hyphen in the tagName', function() {
            expect(utils.supportsAllAttributes({ tagName: 'div', attributes: {} })).to.be(false);
        });
    });

    context('processAttributeName()', function() {
        it('should camel case an attribute', function() {
            expect(utils.processAttributeName('stroke-width')).to.be('strokeWidth');
        });

        it('should not camel case data attribute', function() {
            expect(utils.processAttributeName('data-width')).to.be('data-width');
        });
    });

    context('sanitizeChildren()', function() {
        it('should return null if called with falsy parameter', function() {
            expect(utils.sanitizeChildren()).to.be(null);
            expect(utils.sanitizeChildren(null)).to.be(null);
            expect(utils.sanitizeChildren(undefined)).to.be(null);
            expect(utils.sanitizeChildren(false)).to.be(null);
        });

        it('should not remove supported tags', function() {
            var actual = [ { tagName: 'linearGradient' } ];
            var expected = [ { tagName: 'linearGradient' } ];
            expect(utils.sanitizeChildren(actual)).to.eql(expected);
        });

        it('should remove unsupported tags', function() {
            var actual = [ { tagName: 'lineargradient' } ];
            var expected = [];
            expect(utils.sanitizeChildren(actual)).to.eql(expected);
        });
    });
});

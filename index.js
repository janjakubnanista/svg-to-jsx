'use strict';

var q = require('q');
var assign = require('object-assign');
var parseString = require('xml2js').parseString;
var xmlbuilder = require('xmlbuilder');
var utils = require('./utils.js');

var defaults = {
    removeUseTags: true
};

function cleanupParsedSVGElement(xpath, previousSibling, element) {
    return {
        tagName: element['#name'],
        attributes: element.$,
        children: element.$$,
        text: element._
    };
}

function parseSVG(svg, options, callback) {
    parseString(svg, {
        explicitArray: true,
        explicitChildren: true,
        explicitRoot: false,
        mergeAttrs: false,
        normalize: true,
        normalizeTags: true,
        preserveChildrenOrder: true,
        attrNameProcessors: [utils.camelCase],
        validator: cleanupParsedSVGElement
    }, callback);
}

function afterParseSVG(parsedSVG) {
    utils.forEach(parsedSVG, function(element) {
        if (element.tagName === 'use') {
            var referenceHref = element.attributes && element.attributes['xlink:href'] || '';
            var referenceID = referenceHref.slice(1);
            var reference = utils.filter(parsedSVG, function(ch) {
                return ch.attributes && ch.attributes.id === referenceID;
            }).shift();

            if (reference) {
                element.attributes = assign({}, reference.attributes, { id: null });
                element.children = reference.children;
                element.tagName = reference.tagName;
                element.text = reference.text;
            }
        }

        element.attributes = utils.sanitizeAttributes(element.attributes);
        element.children = utils.sanitizeChildren(element.children);
    });

    return parsedSVG;
}

function formatElementForXMLBuilder(element) {
    var attributes = element.attributes || {};
    var children = element.children && element.children.map(formatElementForXMLBuilder);

    var result = Object.keys(attributes).reduce(function(hash, name) {
        hash['@' + name] = attributes[name];

        return hash;
    }, {});

    if (element.text) result['#text'] = element.text;
    if (children && children.length) result['#list'] = children;

    var wrapped = {};
    wrapped[element.tagName] = result;

    return wrapped;
}

function beforeSVGBuild(parsed) {
    return formatElementForXMLBuilder(parsed);
}

function buildSVG(object) {
    return xmlbuilder
        .create(object, { headless: true })
        .end({ pretty: true, indent: '\t', newline: '\n' });
}

module.exports = function svgToJsx(svg, options, callback) {
    if (arguments.length === 2) {
        callback = options;
        options = {};
    }

    options = assign({}, defaults, options);

    return q
        .nfcall(parseSVG, svg, options)
        .then(afterParseSVG)
        .then(beforeSVGBuild)
        .then(buildSVG)
        .then(function(result) {
            callback(null, result);
        }, function(error) {
            callback(error, null);
        })
        .done();
};

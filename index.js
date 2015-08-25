'use strict';

var q = require('q');
var assign = require('object-assign');
var parseString = require('xml2js').parseString;
var xmlbuilder = require('xmlbuilder');
var utils = require('./utils.js');

var defaults = {
    root: null
};

function cleanupParsedSVGElement(xpath, previousSibling, element) {
    return {
        tagName: element['#name'],
        attributes: element.$ || {},
        children: element.$$ || [],
        text: element._
    };
}

function parseSVG(svg, callback) {
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
            var referenceHref = element.attributes['xlink:href'] || '';
            var referenceID = referenceHref.slice(1);
            var reference = utils.filter(parsedSVG, function(ch) {
                return ch.attributes.id === referenceID;
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
    var attributes = element.attributes;
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

function beforeBuildSVG(options, parsed) {
    if (options.root) {
        // Only allow ID selectors for now
        var root = utils.filter(parsed, function(element) {
            return element.attributes.id === options.root;
        }).shift();

        if (!root) throw new Error('Cannot find root element ' + options.root);

        parsed = root;
    }

    return formatElementForXMLBuilder(parsed);
}

function afterBuildSVG(built) {
    return built.replace(/style="([^!]*)"/ig, function(matched, styleString) {
        var style = styleString.split(/\s*;\s*/g).filter(Boolean).reduce(function(hash, rule) {
            var keyValue = rule.split(/\s*\:\s*(.*)/);
            var property = utils.cssProperty(keyValue[0]);
            var value = keyValue[1];

            hash[property] = value;

            return hash;
        }, {});

        return 'style={' + JSON.stringify(style) + '}';
    });
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
        .nfcall(parseSVG, svg)
        .then(afterParseSVG)
        .then(beforeBuildSVG.bind(null, options))
        .then(buildSVG)
        .then(afterBuildSVG)
        .then(function(result) {
            callback(null, result);
        }, function(error) {
            callback(error, null);
        })
        .done();
};

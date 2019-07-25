'use strict';

var q = require('q');
var assign = require('object-assign');
var parseString = require('xml2js').parseString;
var xmlbuilder = require('xmlbuilder');
var utils = require('./utils.js');

var defaults = {
    passProps: false,
    passChildren: false,
    root: null,
    refs: null
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
        normalizeTags: false,
        preserveChildrenOrder: true,
        attrNameProcessors: [utils.processAttributeName],
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
                element.attributes = assign({}, reference.attributes, element.attributes);
                element.children = reference.children;
                element.tagName = reference.tagName;
                element.text = reference.text;

                delete element.attributes.id;
                delete element.attributes['xlink:href'];
            }
        }

        if (!utils.supportsAllAttributes(element)) {
            element.attributes = utils.sanitizeAttributes(element.attributes);
        }

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

    if (children && children.length) {
        children.forEach(function(child) {
            var tagName = Object.keys(child)[0];
            var existingValue = result[tagName];
            if (existingValue) {
                if (Array.isArray(existingValue)) {
                    // existing element array, push new element
                    existingValue.push(child[tagName]);
                } else {
                    // create array with existing and new elements
                    result[tagName] = [existingValue, child[tagName]];
                }
            } else {
                // first child element with this tag name
                result[tagName] = child[tagName];
            }
        });
    }

    var wrapped = {};
    wrapped[element.tagName] = result;

    return wrapped;
}

function beforeBuildSVG(options, parsed) {
    if (options.root) {
        var root = utils.findById(parsed, options.root);
        if (!root) throw new Error('Cannot find root element #' + options.root);

        parsed = root;
    }

    if (options.refs) {
        Object.keys(options.refs).forEach(function(id) {
            var ref = options.refs[id];

            var element = utils.findById(parsed, id);
            if (!element) throw new Error('Cannot find element #' + id + ' for ref ' + ref);

            element.attributes.ref = ref;
        });
    }

    if (options.passProps) {
        parsed.attributes.passProps = 1;
    }

    if (options.renderChildren) {
        var passChildrenToSpecificId = typeof(options.renderChildren) === 'string';
        var passChildrenTo = passChildrenToSpecificId ? utils.findById(parsed, options.renderChildren) : parsed;

        if (!passChildrenTo) throw new Error('Cannot find element #' + options.renderChildren + ' to render children into');

        passChildrenTo.text = [passChildrenTo.text || '', '{this.props.children}'].join('\n');
    }

    return formatElementForXMLBuilder(parsed);
}

function afterBuildSVG(built) {
    return built
        .replace(/style="((?:[^"\\]|\\.)*)"/ig, function(matched, styleString) {
            var style = styleString.split(/\s*;\s*/g).filter(Boolean).reduce(function(hash, rule) {
                var keyValue = rule.split(/\s*\:\s*(.*)/);
                var property = utils.cssProperty(keyValue[0]);
                var value = keyValue[1];

                hash[property] = value;

                return hash;
            }, {});

            return 'style={' + JSON.stringify(style) + '}';
        })
        .replace(/passProps="1"/, '{...this.props}');
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

    var promise = q
        .nfcall(parseSVG, svg)
        .then(afterParseSVG)
        .then(beforeBuildSVG.bind(null, options))
        .then(buildSVG)
        .then(afterBuildSVG);

    if (callback) {
        promise.done(function(result) {
            callback(null, result);
        }, function(error) {
            callback(error, null);
        });
    }

    return promise;
};

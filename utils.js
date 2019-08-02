'use strict';

var assign = require('object-assign');

var ALLOWED_HTML_ATTRIBUTES = 'accept acceptCharset accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked classID className colSpan cols content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formAction formEncType formMethod formNoValidate formTarget frameBorder headers height hidden high href hrefLang htmlFor httpEquiv icon id label lang list loop low manifest marginHeight marginWidth max maxLength media mediaGroup method min multiple muted name noValidate open optimum pattern placeholder poster preload radioGroup readOnly rel required role rowSpan rows sandbox scope scoped scrolling seamless selected shape size sizes span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode'.split(' ');
var ALLOWED_SVG_ATTRIBUTES = 'clipPath cx cy d dx dy fill fillOpacity fontFamily fillRule fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeOpacity strokeWidth textAnchor transform vectorEffect version viewBox xmlns x1 x2 x y1 y2 y xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space mask maskUnits'.split(' ');

var ALLOWED_ATTRIBUTES = ALLOWED_HTML_ATTRIBUTES.concat(ALLOWED_SVG_ATTRIBUTES);
var ALLOWED_TAGS = 'circle clipPath defs ellipse g image line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan title'.split(' ');

var DATA_ATTRIBUTE = /^data-/i;

exports.cssProperty = function(string) {
    var unprefixed = string.replace(/^-ms/, 'ms');

    return exports.camelCase(unprefixed);
};

exports.camelCase = function(string) {
    return string.replace(/(?:-|_)([a-z])/g, function(g) { return g[1].toUpperCase(); });
};

exports.processAttributeName = function(name) {
    return DATA_ATTRIBUTE.test(name) ? name : exports.camelCase(name);
};

exports.unnamespaceAttributeName = function(name) {
    return name.replace(/(\w+):(\w)/i, function(match, namespace, char) {
        return namespace + char.toUpperCase();
    });
};

exports.sanitizeAttributes = function(attributes) {
    if (!attributes) return null;

    if (attributes.class) {
        attributes.className = attributes.class;
        delete attributes.class;
    }

    var allowed = ALLOWED_ATTRIBUTES.reduce(function(hash, name) {
        if (name in attributes) {
            var unnamespacedName = exports.unnamespaceAttributeName(name);

            hash[unnamespacedName] = attributes[name];
        }

        return hash;
    }, {});

    var custom = Object.keys(attributes).filter(function(name) {
        return DATA_ATTRIBUTE.test(name);
    }).reduce(function(data, name) {
        data[name] = attributes[name];

        return data;
    }, {});

    return assign(allowed, custom);
};

exports.sanitizeChildren = function(children) {
    if (!children) return null;

    return children.filter(function isTagAllowed(child) {
        return ALLOWED_TAGS.indexOf(child.tagName) !== -1;
    });
};

exports.styleAttribute = function(string) {
    var object = string.split(/\s*;\s*/g).reduce(function(hash, keyValue) {
        var split = keyValue.split(/\s*\:\s*/);
        var key = exports.camelCase((split[0] || '').trim());
        var value = (split[1] || '').trim();

        hash[key] = value;

        return hash;
    }, {});

    return JSON.stringify(object);
};

exports.forEach = function(element, callback) {
    element.children && element.children.forEach(function(child) {
        exports.forEach(child, callback);
    });

    callback(element);
};

exports.filter = function(element, test) {
    var filtered = [];

    exports.forEach(element, function(child) {
        if (test(child)) filtered.push(child);
    });

    return filtered;
};

exports.findById = function(element, id) {
    return exports.filter(element, function(node) {
        return node.attributes.id === id;
    }).shift() || null;
};

exports.supportsAllAttributes = function(element) {
    var hasHyphen = element.tagName.indexOf('-') !== -1;
    var hasIsAttribute = 'is' in element.attributes;

    return hasHyphen || hasIsAttribute;
};

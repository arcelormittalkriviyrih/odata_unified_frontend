// build tree from array
// use parent as top element's id
Array.prototype.tree = function (parent) {

    // array data
    var arr = this;
        
    // find child nodes for given parent
    return this.filter(function (el) {
        
        // if parent specified than find it's children
        // else find all elements without parent
        if (typeof parent !== 'undefined') {
            return el.parent == parent;
        } else {
            return arr.filter(function (other) {
                return el.parent == other.id;
            }).length == 0;
        };
               
    }).map(function (el) {

        // create node
        // and continue recursion
        return {
            id: el.id,
            nodes: arr.tree(el.id)
        };
    });
};

// find element from tree
// by node id
Array.prototype.treeNode = function (id) {

    // array data
    var arr = this;
    var node;

    // for each element in tree
    arr.forEach(function (el) {

        // if id match than return item
        // else continue recursion element with nodes
        if (el.id == id)
            node = el;
        else
            node = node || el.nodes.treeNode(id);
    });

    return node;
};

// remove element from tree
// by node id
Array.prototype.treeRemove = function (id) {

    // array data
    var arr = this;

    // for each element in tree
    arr.forEach(function (el) {

        // if id match than remove item
        // else continue recursion element with nodes
        if (el.id == id)
            arr.keyRemove('id', id);            
        else
            el.nodes.treeRemove(id);
    });
};

// find index of element in array
// by key/value
Array.prototype.keyIndex = function (key, value) {

    return this.map(function (el) {
        return el[key];
    }).indexOf(value);
};

// get first item from array
// by key/value
Array.prototype.first = function (key, value) {

    for (var i = 0; i < this.length; i++)
        if (this[i][key] == value)
            return this[i];

    return null;
};

// remove item from array by key
Array.prototype.keyRemove = function (key, value) {

    var index = this.keyIndex(key, value);
    var elems = this.splice(index, 1);

    return elems.length > 0 ? elems[0] : null;
};

// find first item in array
// by condition
// polyfill
Array.prototype.find = function (predicate) {
    if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
            return value;
        }
    }
    return undefined;
};

// find index of first item in array
// by condition
// polyfill
Array.prototype.findIndex = function (predicate) {
    if (this == null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
            return i;
        }
    }
    return -1;
};

// string format
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
      ? args[number]
      : match
        ;
    });
};

// object to array
Object.toArray = function (obj, func) {

    return Object.keys(obj).map(function (el) {
        return func(obj, el);
    });
};

// UUID generator
Math.uuid = function () {

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// get unique elements from array
Array.prototype.unique = function () {

    var u = {}, a = [];
    for (var i = 0, l = this.length; i < l; ++i) {

        if (u.hasOwnProperty(this[i]))
            continue;

        a.push(this[i]);
        u[this[i]] = 1;
    };
    return a;
};

(function (d) {
    d.each(["backgroundColor", "borderBottomColor", "borderLeftColor", "borderRightColor", "borderTopColor", "color", "outlineColor"], function (f, e) {
        d.fx.step[e] = function (g) {
            if (!g.colorInit) {
                g.start = c(g.elem, e);
                g.end = b(g.end);
                g.colorInit = true
            }
            g.elem.style[e] = "rgb(" + [Math.max(Math.min(parseInt((g.pos * (g.end[0] - g.start[0])) + g.start[0]), 255), 0), Math.max(Math.min(parseInt((g.pos * (g.end[1] - g.start[1])) + g.start[1]), 255), 0), Math.max(Math.min(parseInt((g.pos * (g.end[2] - g.start[2])) + g.start[2]), 255), 0)].join(",") + ")"
        }
    });

    function b(f) {
        var e;
        if (f && f.constructor == Array && f.length == 3) {
            return f
        }
        if (e = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)) {
            return [parseInt(e[1]), parseInt(e[2]), parseInt(e[3])]
        }
        if (e = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)) {
            return [parseFloat(e[1]) * 2.55, parseFloat(e[2]) * 2.55, parseFloat(e[3]) * 2.55]
        }
        if (e = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)) {
            return [parseInt(e[1], 16), parseInt(e[2], 16), parseInt(e[3], 16)]
        }
        if (e = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)) {
            return [parseInt(e[1] + e[1], 16), parseInt(e[2] + e[2], 16), parseInt(e[3] + e[3], 16)]
        }
        if (e = /rgba\(0, 0, 0, 0\)/.exec(f)) {
            return a.transparent
        }
        return a[d.trim(f).toLowerCase()]
    }
    function c(g, e) {
        var f;
        do {
            f = d.css(g, e);
            if (f != "" && f != "transparent" || d.nodeName(g, "body")) {
                break
            }
            e = "backgroundColor"
        } while (g = g.parentNode);
        return b(f)
    }
    var a = {
        aqua: [0, 255, 255],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        black: [0, 0, 0],
        blue: [0, 0, 255],
        brown: [165, 42, 42],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgrey: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkviolet: [148, 0, 211],
        fuchsia: [255, 0, 255],
        gold: [255, 215, 0],
        green: [0, 128, 0],
        indigo: [75, 0, 130],
        khaki: [240, 230, 140],
        lightblue: [173, 216, 230],
        lightcyan: [224, 255, 255],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        navy: [0, 0, 128],
        olive: [128, 128, 0],
        orange: [255, 165, 0],
        pink: [255, 192, 203],
        purple: [128, 0, 128],
        violet: [128, 0, 128],
        red: [255, 0, 0],
        silver: [192, 192, 192],
        white: [255, 255, 255],
        yellow: [255, 255, 0],
        transparent: [255, 255, 255],
        tomato: [255, 99, 71]
    }
})(jQuery);
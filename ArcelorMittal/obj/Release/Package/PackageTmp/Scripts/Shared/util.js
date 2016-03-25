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
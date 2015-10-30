var model_1 = require('./model');
var collection, selectedItem, selectedItemIsActive, selectedItemAddress = [-1], collectionMap;
exports.init = function (padCollection) {
    collection = padCollection;
    selectedItem = undefined;
    selectedItemIsActive = false;
    collectionMap = buildMap(collection);
};
exports.getSelectedItemId = function () {
    return selectedItem ? selectedItem._id : '';
};
exports.getSelectedItemAddress = function () {
    return selectedItemAddress;
};
exports.down = function () {
    var downAddress = selectedItemAddress.slice();
    downAddress.push(0);
    if (getValue(collectionMap, downAddress)) {
        selectedItemAddress = downAddress;
    }
    else {
        selectedItemIsActive = true;
        console.log('enter edit mode!');
    }
};
exports.up = function () {
    if (selectedItemIsActive) {
        selectedItemIsActive = false;
        console.log('exit edit mode!');
    }
    else {
        if (1 < selectedItemAddress.length) {
            selectedItemAddress.pop();
        }
    }
};
exports.prev = function () {
    var prevAddress = decrementLast(selectedItemAddress);
    if (getValue(collectionMap, prevAddress)) {
        selectedItemAddress = prevAddress;
    }
    else {
        console.log('reached start!');
    }
};
exports.next = function () {
    var nextAddress = incrementLast(selectedItemAddress);
    if (getValue(collectionMap, nextAddress)) {
        selectedItemAddress = nextAddress;
    }
    else {
        console.log('reached end!');
    }
};
/**
 * Increment the last element in an array of numbers, and return a new array.
 * @param array
 * @returns {Array|*|DOMElement<HTMLAttributes>|{}}
 */
function incrementLast(array) {
    return array.map(function (num, i, arr) {
        return num + +(i === arr.length - 1);
    });
}
function decrementLast(array) {
    return array.map(function (num, i, arr) {
        return num - +(i === arr.length - 1);
    });
}
function getValue(array, address) {
    var val = array;
    address.forEach(function (index) {
        if (val instanceof Array) {
            val = val[index];
        }
    });
    return val;
}
function buildMap(collection) {
    var map = [], lastPage = [];
    for (var i = 0; i < collection.length; i++) {
        var item = collection[i];
        if (item.type === model_1.types.PAGE) {
            if (0 < lastPage.length) {
                map.push(lastPage);
            }
            lastPage = [[]];
        }
        else if (item.type === model_1.types.NOTE) {
            lastPage.push([]);
        }
        else if (item.type === model_1.types.PAD) {
            map.push([]);
        }
    }
    map.push(lastPage);
    return map;
}
var getSubCollection = function (padCollection, selectedItem) {
    if (selectedItem.type === model_1.types.PAGE || selectedItem.type === model_1.types.PAD) {
        return padCollection.filter(function (item) { return item.type === model_1.types.PAGE; });
    }
    if (selectedItem.type === model_1.types.NOTE) {
        return padCollection.filter(function (item) { return item.pageId === selectedItem.pageId; });
    }
    return padCollection[0];
};

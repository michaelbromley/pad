import {types} from 'common/model';


let collection,
    selectedItem,
    selectedItemIsActive,
    selectedItemAddress = [-1],
    collectionMap;

export const init = (padCollection) => {
    collection = padCollection;
    selectedItem = undefined;
    selectedItemIsActive = false;
    collectionMap = buildMap(collection);
};

export const getSelectedItemId = () => {
    return selectedItem ? selectedItem._id : '';
};

export const getSelectedItemAddress = () => {
    return selectedItemAddress;
};

export const down = () => {
    let downAddress = selectedItemAddress.slice();
    downAddress.push(0);
    if (getValue(collectionMap, downAddress)) {
        selectedItemAddress = downAddress;
    } else {
        selectedItemIsActive = true;
        console.log('enter edit mode!');
    }
};

export const up = () => {
   if (selectedItemIsActive) {
       selectedItemIsActive = false;
       console.log('exit edit mode!');
   } else {
       if (1 < selectedItemAddress.length) {
           selectedItemAddress.pop();
       }
   }
};

export const prev = () => {
    let prevAddress = decrementLast(selectedItemAddress);
    if (getValue(collectionMap, prevAddress)) {
        selectedItemAddress = prevAddress;
    } else {
        console.log('reached start!');
    }
};

export const next = () => {
    let nextAddress = incrementLast(selectedItemAddress);
    if (getValue(collectionMap, nextAddress)) {
        selectedItemAddress = nextAddress;
    } else {
        console.log('reached end!');
    }
};

/**
 * Increment the last element in an array of numbers, and return a new array.
 * @param array
 * @returns {Array|*|DOMElement<HTMLAttributes>|{}}
 */
function incrementLast(array) {
    return array.map((num, i, arr) => {
            return num + (i === arr.length - 1);
        }
    );
}

function decrementLast(array) {
    return array.map((num, i, arr) => {
            return num - (i === arr.length - 1);
        }
    );
}

function getValue(array, address) {
    let val = array;
    address.forEach(index => {
        if (val instanceof Array) {
            val = val[index];
        }
    });
    return val;
}

function buildMap(collection) {
    let map = [],
        lastPage = [];
    for (let i = 0; i < collection.length; i ++) {
        let item = collection[i];
        if (item.type === types.PAGE) {
            if (0 < lastPage.length) {
                map.push(lastPage);
            }
            lastPage = [[]];
        } else if (item.type === types.NOTE) {
            lastPage.push([]);
        } else if (item.type === types.PAD) {
            map.push([]);
        }
    }
    map.push(lastPage);
    return map;
}

const getSubCollection = (padCollection, selectedItem) => {
    if (selectedItem.type === types.PAGE || selectedItem.type === types.PAD) {
        return padCollection.filter(item => item.type === types.PAGE);
    }
    if (selectedItem.type === types.NOTE) {
        return padCollection.filter(item => item.pageId === selectedItem.pageId);
    }
    return padCollection[0];
};
    
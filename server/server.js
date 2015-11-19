'use strict';

var express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    Datastore = require('nedb'),
    path = require('path');

var app = express();

app.use(express.static(path.resolve(__dirname + '/../build')));
app.use(express.static(path.resolve(__dirname + '/../node_modules')));
app.use(bodyParser.json());
app.use(cors());
app.listen(3000);

var db = new Datastore({ filename: __dirname + '/datastore', autoload: true });

const types = {
    PAD: 'pad',
    PAGE: 'page',
    NOTE: 'note'
};

function identity(arg) {
    return arg;
}

/**
 * Returns the value of the "type" property of item, with added guard logic.
 * @param item
 * @returns {*}
 */
function getType(item) {
    if (!item.hasOwnProperty('type')) {
        console.log('bad item:', item);
        throw new Error('Type not specified');
    }
    let validType = Object.keys(types).map(key => types[key]).indexOf(item.type) > -1;
    if (!validType) {
        throw new Error(`'${item.type}' is not a  valid item type.`);
    }
    return item.type;
}

/**
 * Splice an array arr into the target array at the given index. Returns a new array.
 * @param target
 * @param arr
 * @param index
 * @returns {*}
 */
function spliceArray(target, arr, index) {
    let targetClone = target.slice();
    Array.prototype.splice.apply(targetClone, [index, 0].concat(arr));
    return targetClone;
}

/**
 * Given an array of objects of the same type, group them by the specified property
 * into an object, where the key of each group is the property value.
 *
 * @param objArray
 * @param prop
 * @returns {Object}
 */
function groupBy(objArray, prop) {
    let groups = {};
    objArray.forEach(obj => {
        let propVal = obj[prop];
        if (!groups[propVal]) {
            groups[propVal] = [obj];
        } else {
            groups[propVal].push(obj);
        }
    });

    return groups;
}

/**
 * Given an item with an "order" property, find all items following it in sequence and update their orders
 * to come after it. -1 is a special value of oldOrder to signify a newly-created item.
 *
 * @param item
 * @param oldOrder
 * @param cb
 */
function reOrderFollowingItems(item, oldOrder, cb) {

    if (item.type === types.PAGE || item.type === types.NOTE) {
        let inc;
        let query = {
            type: item.type,
            _id: { $ne: item._id }
        };

        if (item.type === types.PAGE) {
            query.padId = item.padId;
        } else if (item.type === types.NOTE) {
            query.pageId = item.pageId;
        }

        if (oldOrder === -1) {
            // item is being newly-inserted
            query.order = {
                $gte: item.order
            };
            inc = 1;
        } else if (item.order < oldOrder) {
            // item has moved earlier in sequence
            query.order = {
                $gte: item.order,
                $lt: oldOrder
            };
            inc = 1;
        } else if (oldOrder < item.order) {
            // item has move later in sequence
            query.order = {
                $gt: oldOrder,
                $lte: item.order
            };
            inc = -1;
        }

        db.update(query, {$inc: {order: inc}}, {multi: true}, cb);
    } else {
        cb();
    }
}

/**
 * List Pads
 */
app.get('/api/pads', function(req, res) {
    db.find({type: types.PAD}, (err, docs) => res.send(docs));
});


/**
 * Get Pad & contents as a flat array in the correct order
 */
app.get('/api/pads/:id', function(req, res) {
    let padId = req.params.id,
        padCollection = [];

    db.findOne({type: types.PAD, _id: padId}, (err, pad) => {

        padCollection.push(pad);

        db.find({type: types.PAGE, padId: padId}).sort({ order: 1 }).exec((err, pages) => {

            padCollection = padCollection.concat(pages);

            let query = {$and: [
                { type: types.NOTE },
                { $or : pages.map(page => ({ pageId: page._id })) }
            ] };

            db.find(query).sort({ order: 1 }).exec((err, notes) => {

                let groupedNotes = groupBy(notes, 'pageId');
                for(let pageId in groupedNotes) {
                    let index = padCollection.map(item => item._id).indexOf(pageId),
                        group = groupedNotes[pageId];

                    padCollection = spliceArray(padCollection, group, index + 1);
                }


                res.send(padCollection);
            });
        });

    });
});

/**
 * Create Item
 */
app.post('/api/items', function(req, res) {
    let item = req.body;
    getType(item);
    db.insert(item, () => {
        reOrderFollowingItems(item, -1, () => res.send(item));
    });
});


/**
 * Read Item
 */
app.get('/api/items/:id', function(req, res) {
    db.find({_id: req.params.id}, (item) => res.send(item));
});

/**
 * Update Item
 */
app.put('/api/items/:id', function(req, res) {
    let item = req.body;
    getType(item);
    db.findOne({ _id: item._id}, (err, oldItem) => {
        db.update({_id: req.params.id}, item, () => {
            if (oldItem.order !== item.order) {
                reOrderFollowingItems(item, oldItem.order, () => res.send(item));
            } else {
                res.send(item);
            }
        });
    });

});

/**
 * Delete Item
 */
app.delete('/api/items/:id', function(req, res) {
    let id = req.params.id;
    db.remove({_id: id}, () => res.send(id));
});

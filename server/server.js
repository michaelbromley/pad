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

        db.find({type: types.PAGE, padId: padId}, (err, pages) => {

            padCollection = padCollection.concat(pages);

            let query = {$and: [
                { type: types.NOTE },
                { $or : pages.map(page => ({ pageId: page._id })) }
            ] };

            db.find(query, (err, notes) => {

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
    db.insert(item, () => res.send(item));
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
    db.update({_id: req.params.id}, item, (item) => res.send(item));
});

/**
 * Delete Item
 */
app.delete('/api/item/:id', function(req, res) {
    let id = req.params.id;
    db.remove({_id: id}, () => res.send(id));
});
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

/**
 * Given an item with an "order" property, find all items following it in sequence and update their orders
 * to come after it. -1 is a special value of oldOrder to signify a newly-created item.
 *
 * @param item
 * @param oldOrder
 * @param cb
 */
function reOrderFollowingItems(item, oldOrder, cb) {

    let inc;
    let query = {
        _id: { $ne: item.uuid }
    };

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
}

/**
 * Given an array of items which all have a numeric "order" property, this function
 * returns true if those items are arranged in consecutive order with a difference
 * of 1 between each item.
 * @param items
 * @returns {boolean}
 */
function itemOrdersAreConsecutive(items) {
    let orders = items.map(item => item.order);
    let consecutive = true;
    for (let i = 0; i < orders.length; i++) {
        let prev = orders[i - 1] || 0;
        let curr = orders[i];
        if (curr - prev !== 1) {
            consecutive = false;
        }
    }
    return consecutive;
}

function setOrderByIndex(item, index) {
    item.order = index + 1;
    return item;
}

/**
 * List Pads
 */
app.get('/api/pads', function(req, res) {
    db.find({}).sort({ order: 1}).exec((err, pads) => {
        let orderValuesAreConsecutive = itemOrdersAreConsecutive(pads);
        if (!orderValuesAreConsecutive) {
            console.log('Order values for pads are not consecutive. Reordering...');
            pads.forEach((pad, index) => db.update({_id: pad.uuid}, pad));
            pads = pads.map(setOrderByIndex);
        }
        res.send(pads);
    });
});


/**
 * Create Pad
 */
app.post('/api/pads', function(req, res) {
    let item = req.body;
    db.insert(item, () => {
        reOrderFollowingItems(item, -1, () => res.send(item));
    });
});


/**
 * Read Pad
 */
app.get('/api/pads/:id', function(req, res) {
    db.findOne({uuid: req.params.id}, (err, item) => res.send(item));
});

/**
 * Update Pad
 */
app.put('/api/pads/:id', function(req, res) {
    let pad = req.body;
    db.findOne({ uuid: pad.uuid}, (err, oldItem) => {
        db.update({uuid: req.params.id}, pad, () => {
            if (oldItem.order !== pad.order) {
                reOrderFollowingItems(pad, oldItem.order, () => res.send(pad));
            } else {
                res.send(pad);
            }
        });
    });

});

/**
 * Delete Pad
 */
app.delete('/api/pads/:id', function(req, res) {
    let id = req.params.id;
    db.remove({uuid: id}, () => res.send(id));
});

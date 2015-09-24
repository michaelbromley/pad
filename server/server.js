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
 * List Pads
 */
app.get('/api/pads', function(req, res) {
    db.find({type: 'pad'}, (err, docs) => res.send(docs));
});


/**
 * Get Pad & contents
 */
app.get('/api/pads/:id', function(req, res) {
    var padId = req.params.id;

    db.findOne({type: 'pad', _id: padId}, (err, pad) => {

        db.find({type: 'page', padId: padId}, (err, pages) => {
            pad.pages = pages;
            console.log('sending pad:');
            console.log(pad);
            res.send(pad);
        });

    });
});

/**
 * Create Pad
 */
app.post('/api/pads', function(req, res) {
    console.log('body: ' + JSON.stringify(req.body));
    var pad = req.body;
    pad.type = 'pad';
    db.insert(pad, () => res.send(pad));
});

/**
 * Update Pad
 */
app.put('/api/pads/:id', function(req, res) {
    console.log('updating pad:', req.body);
    var pad = req.body;
    pad.type = 'pad';
    pad.id = req.params.id;
    db.update({_id: req.params.id}, pad, () => res.send(pad));
});

/**
 * Delete Pad
 */
app.delete('/api/pads/:id', function(req, res) {
    console.log(req.params);
    var id = req.params.id;
    console.log('deleteing pad with id ' + req.params.id);
    db.remove({_id: req.params.id}, () => res.send(id));
});

/**
 * Create Page
 */
app.post('/api/pads/:id/pages', function(req, res) {
    console.log('creating page: '+ JSON.stringify(req.body) );
    var padId = req.params.id,
        page = req.body;

    page.type = 'page';
    page.padId = padId;
    db.insert(page, () => res.send(padId));
});

/**
 * Delete Page
 */
app.delete('/api/pads/:padId/pages/:pageId', function(req, res) {
    console.log(req.params);
    var padId = req.params.padId,
        pageId = req.params.pageId;

    console.log('deleteing pad with id ' + req.params.id);
    db.remove({_id: pageId, padId: padId}, () => res.send(pageId));
});

/**
 * Update Page
 */
app.put('/api/pads/:padId/pages/:pageId', function(req, res) {
    console.log('updating page:', req.body);
    var page = req.body;

    db.update({_id: page._id}, page, () => res.send(page));
});

/**
 * Create Note
 */
app.post('/api/pads/:padId/pages/:pageId/notes', function(req, res) {
    console.log('creating note: '+ JSON.stringify(req.body) );
    var pageId = req.params.pageId,
        note = req.body;

    note.type = 'note';
    note.pageId = pageId;
    db.insert(note, () => res.send(pageId));
});

/**
 * Delete Note
 */
app.delete('/api/pads/:padId/pages/:pageId/notes/:noteId', function(req, res) {
    var pageId = req.params.pageId,
        noteId = req.params.noteId;

    console.log('deleteing note with id ' + noteId);
    db.remove({_id: noteId, pageId: pageId}, () => res.send(pageId));
});

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

app.get('/api/pads', function(req, res) {
    db.find({}, (err, docs) => res.send(docs));
});

app.get('/api/pads/:id', function(req, res) {
    db.findOne({_id: req.params.id}, (err, docs) => res.send(docs));
});

app.post('/api/pads', function(req, res) {
    console.log('body: ' + JSON.stringify(req.body));
    var pad = req.body;
    db.insert(pad, () => {res.send(pad)});
});

app.delete('/api/pads/:id', function(req, res) {
    console.log(req.params);
    var id = req.params.id;
    console.log('deleteing pad with id ' + req.params.id);
    db.remove({_id: req.params.id}, () => res.send(id));
});
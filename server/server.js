var express = require('express'),
    bodyParser = require('body-parser'),
    Datastore = require('nedb'),
    path = require('path');

var app = express();

app.use(express.static(path.resolve('../build')));
app.use(express.static(path.resolve('../node_modules')));
app.use(bodyParser.json());
app.listen(3000);

var db = new Datastore({ filename: 'datastore', autoload: true });

app.get('/', function(req, res) {
   res.sendFile(path.resolve('../build/index.html'));
});

app.post('/api/names', function(req, res) {
    console.log('body: ' + JSON.stringify(req.body));
    db.insert({ name: req.body.name });
    res.send();
});

app.get('/api/names', function(req, res) {
    db.find({}, (err, docs) => res.send(docs));
});
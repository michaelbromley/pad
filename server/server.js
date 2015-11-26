'use strict';
var express = require('express'), cors = require('cors'), bodyParser = require('body-parser'), Datastore = require('nedb'), path = require('path'), PadStore = require('./padStore').PadStore;
var app = express();
app.use(express.static(path.resolve(__dirname + '/../build')));
app.use(express.static(path.resolve(__dirname + '/../node_modules')));
app.use(bodyParser.json());
app.use(cors());
app.listen(3000);
var db = new Datastore({ filename: __dirname + '/datastore', autoload: true });
var dataStore = new PadStore(db);
app.get('/api/pads', function (req, res) {
    dataStore.getPads().subscribe(function (pads) { return res.send(pads); });
});
app.post('/api/pads', function (req, res) {
    dataStore.createPad(req.body).subscribe(function (pad) { return res.send(pad); });
});
app.get('/api/pads/:id', function (req, res) {
    dataStore.getPad(req.params.id).subscribe(function (pad) { return res.send(pad); });
});
app.put('/api/pads/:id', function (req, res) {
    dataStore.updatePad(req.body).subscribe(function (pad) { return res.send(pad); });
});
app.delete('/api/pads/:id', function (req, res) {
    dataStore.deletePad(req.params.id).subscribe(function (uuid) { return res.send(uuid); });
});

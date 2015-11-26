'use strict';

let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let Datastore = require('nedb');
let path = require('path');
let PadStore = require('./padStore').PadStore;
let app = express();
let db = new Datastore({ filename: __dirname + '/datastore', autoload: true });
let dataStore = new PadStore(db);

app.use(express.static(path.resolve(__dirname + '/../build')));
app.use(express.static(path.resolve(__dirname + '/../node_modules')));
app.use(bodyParser.json());
app.use(cors());
app.listen(3000);

app.get('/api/pads', (req, res) => {
    dataStore.getPads().subscribe(pads => res.send(pads));
});

app.post('/api/pads', (req, res) => {
    dataStore.createPad(req.body).subscribe(pad => res.send(pad));
});

app.get('/api/pads/:id', (req, res) => {
    dataStore.getPad(req.params.id).subscribe(pad => res.send(pad));
});

app.put('/api/pads/:id', (req, res) => {
    dataStore.updatePad(req.body).subscribe(pad => res.send(pad));
});

app.delete('/api/pads/:id', (req, res) => {
    dataStore.deletePad(req.params.id).subscribe(uuid => res.send(uuid));
});
var MessageType = require('./model').MessageType;
'use strict';
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var Datastore = require('nedb');
var path = require('path');
var PadStore = require('./padStore').PadStore;
var app = express();
var server = require('http').Server(app);
var sockjs = require('sockjs');
var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
var db = new Datastore({ filename: __dirname + '/datastore', autoload: true });
var dataStore = new PadStore(db);
app.use(express.static(path.resolve(__dirname + '/../build')));
app.use(express.static(path.resolve(__dirname + '/../node_modules')));
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));
app.listen(3000);
/**
 * REST endpoints
 */
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
/**
 * Web socket handlers
 */
var clients = {};
// Broadcast to all clients
function broadcast(message) {
    // iterate through each client in clients object
    for (var client in clients) {
        // send the message to that client
        clients[client].write(JSON.stringify(message));
    }
}
echo.on('connection', function (conn) {
    // add this client to clients object
    clients[conn.id] = conn;
    conn.on('data', function (msg) {
        var message = JSON.parse(msg);
        if (message.type === MessageType.Action) {
            dataStore.addActionToPad(message.data.padUuid, message.data)
                .subscribe(function () {
                broadcast(message);
            });
        }
        if (message.type === MessageType.Lock) {
            broadcast(message);
        }
        if (message.type === MessageType.Unlock) {
            broadcast(message);
        }
    });
    conn.on('close', function () {
        delete clients[conn.id];
    });
});
echo.installHandlers(server, { prefix: '/echo' });
server.listen(9999, '0.0.0.0');

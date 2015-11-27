import {IMessage} from "../app/common/model";
import {Server} from "sockjs";
let MessageType: MessageType = require('./model').MessageType;

'use strict';

let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let Datastore = require('nedb');
let path = require('path');
let PadStore = require('./padStore').PadStore;
let app = express();
let server = require('http').Server(app);
let sockjs = require('sockjs');
let echo: Server = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
let db = new Datastore({ filename: __dirname + '/datastore', autoload: true });
let dataStore = new PadStore(db);

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

/**
 * Web socket handlers
 */
let clients = {};
// Broadcast to all clients
function broadcast(message){
    // iterate through each client in clients object
    for (var client in clients){
        // send the message to that client
        clients[client].write(JSON.stringify(message));
    }
}

echo.on('connection', (conn) => {

    // add this client to clients object
    clients[conn.id] = conn;

    conn.on('data', (msg) => {
        let message: IMessage<any> = JSON.parse(msg);

        if (message.type === MessageType.Action) {
            dataStore.addActionToPad(message.data.padUuid, message.data)
            .subscribe(() => {
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

    conn.on('close', () => {
        delete clients[conn.id];
    });

});
echo.installHandlers(server, {prefix:'/echo'});
server.listen(9999, '0.0.0.0');
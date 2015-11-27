import {Injectable, EventEmitter} from 'angular2/angular2';
import SockJSClass = __SockJSClient.SockJSClass;
import {Action, IMessage, MessageType} from "./model";
let uuid = require('uuid');
let SockJS = require('sockjs-client');
let sock: SockJSClass = new SockJS('http://localhost:9999/echo', null, { server: 1234 });

/**
 * Service which uses a web socket connection to send and receive messages
 * about updates to pads so that collborative editing can take place.
 */
@Injectable()
export class CollabService {

    /**
     * This ID is used to identify the origin of any websocket messages.
     * This can be used to ensure we only react to external messages.
     */
    private instanceUuid: string;
    public action: EventEmitter<Action> = new EventEmitter();

    constructor() {

        this.instanceUuid = uuid();

        sock.onopen = function() {
            console.log('socket open');
        };
        sock.onmessage = (e) => {
            let message: IMessage<any> = JSON.parse(e.data);
            if (message.type === MessageType.Action) {
                this.receiveAction(message);
            }
        };
        sock.onclose = function() {
            console.log('closed socket');
        };
    }

    public emitAction(action: Action) {
        let message: IMessage<Action> = {
            originUuid: this.instanceUuid,
            type: MessageType.Action,
            data: action
        };
        sock.send(JSON.stringify(message));
    }

    private receiveAction(message: IMessage<Action>) {
        if (message.originUuid !== this.instanceUuid) {
            this.action.next(message.data)
        }
    }
}
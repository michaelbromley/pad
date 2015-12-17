import {Injectable, EventEmitter, NgZone} from 'angular2/core';
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
    private locked: { [uuid: string] : boolean } = {};

    constructor(private ngZone: NgZone) {

        this.instanceUuid = uuid();

        sock.onopen = function() {
            console.log('socket open');
        };
        sock.onmessage = (e) => {
            ngZone.run(() => {
                let message: IMessage<any> = JSON.parse(e.data);
                if (message.type === MessageType.Action) {
                    this.receiveAction(message);
                }
                if (message.type === MessageType.Lock || message.type === MessageType.Unlock) {
                    this.receiveLock(message);
                }
            });

        };
        sock.onclose = function() {
            console.log('closed socket');
        };
    }

    public lockItem(uuid: string) {
        let message: IMessage<string> = {
            originUuid: this.instanceUuid,
            type: MessageType.Lock,
            data: uuid
        };
        sock.send(JSON.stringify(message));
    }

    public unlockItem(uuid: string) {
        let message: IMessage<string> = {
            originUuid: this.instanceUuid,
            type: MessageType.Unlock,
            data: uuid
        };
        sock.send(JSON.stringify(message));
    }

    public emitAction(action: Action) {
        let message: IMessage<Action> = {
            originUuid: this.instanceUuid,
            type: MessageType.Action,
            data: action
        };
        sock.send(JSON.stringify(message));
    }

    public isItemLocked(uuid: string) {
        return !!this.locked[uuid];
    }

    private receiveAction(message: IMessage<Action>) {
        if (message.originUuid !== this.instanceUuid) {
            this.action.emit(message.data);
        }
    }

    private receiveLock(message: IMessage<string>) {
        if (message.originUuid !== this.instanceUuid) {
            this.locked[message.data] = (message.type === MessageType.Lock);
        }
    }
}
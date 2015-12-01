let uuid = require('uuid');

export const Type = {
    PAD: 'pad',
    PAGE: 'page',
    NOTE: 'note'
};

export interface IPadItem {
    uuid: string;
    type: string;
    title?: string;
    content?: string;
}

export class Pad {
    public uuid: string = '';
    public title: string = '';
    public created: number;
    public type: string = Type.PAD;
    public pages: Page[] = [];
    public history: Action[] = [];
    public historyPointer: number = -1;

    constructor() {
        this.uuid = uuid.v4();
        this.created = Date.now();
    }
}

export class Page {
    public uuid: string = '';
    public title: string = '';
    public type: string = Type.PAGE;
    public notes: Note[] = [];

    constructor() {
        this.uuid = uuid.v4();
    }
}

export class Note {
    public uuid: string = '';
    public content: string = '';
    public type: string = Type.NOTE;
    public order: number;

    constructor() {
        this.uuid = uuid.v4();
    }
}


export enum ActionType {
    CREATE_PAGE,
    CREATE_NOTE,
    UPDATE_PAD,
    UPDATE_PAGE,
    UPDATE_NOTE,
    DELETE_PAGE,
    DELETE_NOTE,
    MOVE_PAGE,
    MOVE_NOTE
}

export class Action {
    uuid: string;
    type: ActionType;
    padUuid: string;
    data: any;
    created: number;

    constructor(type: ActionType, padUuid: string) {
        this.type = type;
        this.padUuid = padUuid;
        this.uuid = uuid();
        this.created = Date.now();
    }
}


export interface IMessage<T> {
    originUuid: string,
    type: MessageType,
    data: T
}

export enum MessageType {
    Action,
    Lock,
    Unlock
}

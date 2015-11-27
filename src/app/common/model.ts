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
    public modified: number;
    public type: string = Type.PAD;
    public pages: Page[] = [];

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
    // the client instance that created this action
    originUuid: string;
    type: ActionType;
    padUuid: string;
    data: any;
    created: number;

    constructor(type: ActionType) {
        this.type = type;
        this.uuid = uuid();
        this.created = Date.now();
    }
}
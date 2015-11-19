export const types = {
    PAD: 'pad',
    PAGE: 'page',
    NOTE: 'note'
};

export interface IPadItem {
    _id: string;
    type: string;
    name?: string;
    title?: string;
    content?: string;
    padId?: string;
    pageId?: string
}

export class Pad implements IPadItem {
    public _id: string = '';
    public name: string = '';
    public type: string = types.PAD;
}

export class Page implements IPadItem {

    public padId: string;
    public _id: string = '';
    public title: string = '';
    public type: string = types.PAGE;
    public order: number;

    constructor(padId) {
        this.padId = padId;
    }


}

export class Note implements IPadItem {

    public pageId: string;
    public _id: string = '';
    public content: string = '';
    public type: string = types.NOTE;
    public order: number;

    constructor(pageId) {
        this.pageId = pageId;
    }
}
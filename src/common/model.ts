export const types = {
    PAD: 'pad',
    PAGE: 'page',
    NOTE: 'note'
};

export class Pad {
    public _id: string = '';
    public title: string = '';
    public type: string = types.PAD;
}

export class Page {

    public padId: string;
    public _id: string = '';
    public title: string = '';
    public type: string = types.PAGE;

    constructor(padId) {
        this.padId = padId;
    }


}

export class Note {

    public pageId: string;
    public _id: string = '';
    public content: string = '';
    public type: string = types.NOTE;

    constructor(pageId) {
        this.pageId = pageId;
    }
}
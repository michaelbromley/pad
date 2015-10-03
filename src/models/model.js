export const types = {
    PAD: 'pad',
    PAGE: 'page',
    NOTE: 'note'
};

export class Pad {
    _id = '';
    title = '';
    type = types.PAD;
}

export class Page {

    constructor(padId) {
        this.padId = padId;
    }

    _id = '';
    title = '';
    type = types.PAGE;
}

export class Note {

    constructor(pageId) {
        this.pageId = pageId;
    }

    _id = '';
    content = '';
    type = types.NOTE;
}
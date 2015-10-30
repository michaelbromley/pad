exports.types = {
    PAD: 'pad',
    PAGE: 'page',
    NOTE: 'note'
};
var Pad = (function () {
    function Pad() {
        this._id = '';
        this.title = '';
        this.type = exports.types.PAD;
    }
    return Pad;
})();
exports.Pad = Pad;
var Page = (function () {
    function Page(padId) {
        this._id = '';
        this.title = '';
        this.type = exports.types.PAGE;
        this.padId = padId;
    }
    return Page;
})();
exports.Page = Page;
var Note = (function () {
    function Note(pageId) {
        this._id = '';
        this.content = '';
        this.type = exports.types.NOTE;
        this.pageId = pageId;
    }
    return Note;
})();
exports.Note = Note;

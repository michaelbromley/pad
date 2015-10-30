var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var angular2_1 = require('angular2/angular2');
var marked_1 = require('marked');
var NoteEditor = (function () {
    function NoteEditor(props) {
        var _this = this;
        this._focus = false;
        this.focus = function () {
            _this._focus = true;
        };
        this.change = function (event) {
            var note = _this.props.note;
            note.content = event.target.value;
            _this.props.onChange(note);
            _this.autoSize(event.target);
        };
        this.blur = function (event) {
            _this.setState({
                focus: false
            });
            _this.props.onBlur(_this.props.note);
        };
        this.keyHandler = function (event) {
            var keyCode = event.keyCode || event.which, textarea = event.target;
            if (keyCode == 9) {
                event.preventDefault();
                var start = textarea.selectionStart, end = textarea.selectionEnd;
                // set textarea value to: text before caret + tab + text after caret
                textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
                // put caret at right position again
                textarea.selectionStart = textarea.selectionEnd = start + 1;
            }
        };
    }
    NoteEditor.prototype.componentDidMount = function () {
        /*let textarea = this.refs.input.getDOMNode();
        textarea.setAttribute('style', 'height:' + (textarea.scrollHeight) + 'px;overflow-y:hidden;');*/
    };
    NoteEditor.prototype.parseMarkdown = function (md) {
        return {
            __html: marked_1.default(md || '')
        };
    };
    NoteEditor.prototype.autoSize = function (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    };
    NoteEditor.prototype.render = function () {
        var outerClass = 'note-editor ' + (this.state.focus ? 'focus' : ''), inputClass = 'input ' + this.props.element, previewHtml = this.parseMarkdown(this.props.note.content);
        return;
    };
    NoteEditor = __decorate([
        angular2_1.Component({
            template: "\n      <div className={outerClass} tabIndex=\"0\" onClick={this.focus} onFocus={this.focus}>\n                <textarea value={this.props.note.content} className=\"input\"\n                          ref=\"input\"\n                          onChange={this.change}\n                          onBlur={this.blur}\n                          onKeyDown={this.keyHandler}></textarea>\n                <div className=\"preview\" dangerouslySetInnerHTML={previewHtml}></div>\n            </div>"
        }), 
        __metadata('design:paramtypes', [Object])
    ], NoteEditor);
    return NoteEditor;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NoteEditor;

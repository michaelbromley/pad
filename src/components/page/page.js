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
var Page = (function () {
    function Page(props) {
        this.onUpdateTitle = function (title) {
            /* let page = this.props.page;
             page.title = title;
             this.props.onUpdate(page);*/
        };
        this.onSetTitle = function (title) {
            /* let page = this.props.page;
             page.title = title;
             this.props.onChange(page);*/
        };
        this.createNote = function (note) {
            //this.props.onCreateNote(this.props.page._id, note.title);
        };
        this.onUpdateNote = function (note) {
            /* let page = this.props.page,
                 index = page.notes.map(note => note._id).indexOf(note._id);
             page.notes[index] = note;
             this.props.onUpdate(page);*/
        };
        this.onSetNote = function (note) {
            /*  let page = this.props.page,
                  index = page.notes.map(note => note._id).indexOf(note._id);
              page.notes[index] = note;
              this.props.onChange(page);*/
        };
    }
    Page = __decorate([
        angular2_1.Component({
            template: require('./page.html')
        }), 
        __metadata('design:paramtypes', [Object])
    ], Page);
    return Page;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Page;

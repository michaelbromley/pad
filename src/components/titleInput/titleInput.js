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
var TitleInput = (function () {
    function TitleInput() {
        var _this = this;
        this.focussed = false;
        this.focus = function () {
            _this.focussed = true;
        };
        this.change = function (event) {
            //this.props.onChange(event.target.value);
        };
        this.blur = function (event) {
            _this.focussed = false;
            //this.props.onBlur(event.target.value);
        };
    }
    TitleInput = __decorate([
        angular2_1.Component({
            selector: 'title-input',
            template: "\n     <div class=\"title-input\" [ng-class]=\"{ focus: focussed }\" tabIndex=\"0\" (click)=\"focus()\" (focus)=\"focus()\">\n        <h1 class=\"label\">{{ title }}</h1>\n        <div class=\"input {{ element }}\">\n            <input #input [value]=\"title\"\n                   (change)=\"change()\"\n                   (blur)=\"blur()\" />\n        </div>\n     </div>",
            directives: [angular2_1.CORE_DIRECTIVES],
            inputs: ['title', 'element']
        }), 
        __metadata('design:paramtypes', [])
    ], TitleInput);
    return TitleInput;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TitleInput;

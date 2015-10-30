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
var router_1 = require('angular2/router');
var model_1 = require('../../common/model');
var dataService_1 = require('../../common/dataService');
//import Page from '../page/page';
var titleInput_1 = require('../titleInput/titleInput');
//import NoteEditor from '../noteEditor/noteEditor';
var navigator = require('../../common/navigator');
var keyboardJS = require('keyboardjs');
var PadCmp = (function () {
    function PadCmp(dataService, params) {
        var _this = this;
        this.dataService = dataService;
        this.newPageTitle = '';
        this.padCollection = [];
        this.selectedItemAddress = '';
        this.pad = {};
        this.pages = [];
        this.notes = [];
        dataService.fetchPad(params.get('id')).subscribe(function (pad) {
            console.log('pad fetched:', pad);
            _this.padCollection = pad;
            _this.pad = _this.padCollection[0] || {};
            _this.pages = _this.padCollection.filter(function (item) { return item.type === model_1.types.PAGE; });
            _this.notes = _this.padCollection.filter(function (item) { return item.type === model_1.types.NOTE; });
            console.log('this.pad', _this.pad);
            console.log('this.pages', _this.pages);
            console.log('this.notes', _this.notes);
            navigator.init(pad);
        });
        keyboardJS.bind('down', function () {
            navigator.next();
            _this.selectedItemAddress = navigator.getSelectedItemAddress();
        });
        keyboardJS.bind('up', function () {
            navigator.prev();
            _this.selectedItemAddress = navigator.getSelectedItemAddress();
        });
        keyboardJS.bind('enter', function () {
            navigator.down();
            _this.selectedItemAddress = navigator.getSelectedItemAddress();
        });
        keyboardJS.bind('escape', function () {
            navigator.up();
            _this.selectedItemAddress = navigator.getSelectedItemAddress();
        });
    }
    PadCmp.prototype.checkSelected = function (address) {
        return this.selectedItemAddress.toString() === address.toString() ? 'selected' : '';
    };
    PadCmp = __decorate([
        angular2_1.Component({
            selector: 'pad',
            template: require('./pad.html'),
            directives: [angular2_1.CORE_DIRECTIVES, titleInput_1.default],
            providers: [dataService_1.default]
        }), 
        __metadata('design:paramtypes', [dataService_1.default, router_1.RouteParams])
    ], PadCmp);
    return PadCmp;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PadCmp;

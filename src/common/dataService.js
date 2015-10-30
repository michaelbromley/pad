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
var config_1 = require('../common/config');
var http_1 = require('angular2/http');
var angular2_1 = require('angular2/angular2');
var DataService = (function () {
    function DataService(http) {
        this.http = http;
    }
    DataService.prototype.fetchPadList = function () {
        return this.http.get(config_1.default.API_URL + "/pads")
            .map(function (res) { return res.json(); });
    };
    DataService.prototype.fetchPad = function (id) {
        return this.http.get(config_1.default.API_URL + "/pads/" + id)
            .then(function (res) { return res.data; });
    };
    DataService.prototype.createItem = function (item) {
        return this.http.post(config_1.default.API_URL + "/items", item);
    };
    DataService.prototype.updateItem = function (item) {
        return this.http.put(config_1.default.API_URL + "/items/" + item._id, item);
    };
    DataService.prototype.deleteItem = function (item) {
        return this.http.delete(config_1.default.API_URL + "/pads/" + item._id);
    };
    DataService = __decorate([
        angular2_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], DataService);
    return DataService;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DataService;

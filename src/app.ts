// Bootstrapping module
import {Component, bootstrap} from 'angular2/angular2';

// Common styles
require('flexboxgrid/dist/flexboxgrid.css');
require('styles/main.less');

@Component({
    selector: 'app',
    template: '<h1>My First Angular 2 App!</h1>'
})
class AppComponent { }

bootstrap(AppComponent);
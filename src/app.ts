// Bootstrapping module
import {Component, bootstrap, provide} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import PadListCmp from './components/padList/padListCmp';

// Common styles
require('flexboxgrid/dist/flexboxgrid.css');
require('styles/main.less');

@Component({
    selector: 'app',
    directives: [ROUTER_DIRECTIVES, PadListCmp],
    template: `
    <div>
        <div className="header">Pad.</div>
        <router-outlet></router-outlet>
    </div>`,
    providers: [
        ROUTER_PROVIDERS,
        provide(LocationStrategy, {useClass: HashLocationStrategy})
    ]
})
@RouteConfig([
    { path: '/', component: PadListCmp, as: 'PadListCmp' }
])
class AppComponent { }

bootstrap(AppComponent, [HTTP_PROVIDERS]);

/*import {bootstrap, Component} from 'angular2/angular2';

@Component({
    template: '<div>{{ foo }}</div>',
    selector: 'app'
})
class App{
    foo = 'YOLO';
}

bootstrap(App);*/

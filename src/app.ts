// Bootstrapping module
import {Component, bootstrap, provide} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS, RequestOptions, BaseRequestOptions, Headers} from 'angular2/http';
import PadListCmp from './components/padList/padList.cmp';
import PadCmp from './components/pad/pad.cmp';

// Common styles
require('flexboxgrid/dist/flexboxgrid.css');
require('styles/main.less');

@Component({
    selector: 'app',
    directives: [ROUTER_DIRECTIVES],
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
    { path: '/', component: PadListCmp, as: 'PadList' },
    { path: '/pad/:id', component: PadCmp, as: 'Pad' }
])
class AppComponent { }

var defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'application/json');
class appRequestOptions extends BaseRequestOptions {
  headers = defaultHeaders;
}

bootstrap(AppComponent, [HTTP_PROVIDERS, provide(RequestOptions, {useClass: appRequestOptions})]);
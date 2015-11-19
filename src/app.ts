// Bootstrapping module
import {Component, bootstrap, provide, HostListener} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS, RequestOptions, BaseRequestOptions, Headers} from 'angular2/http';
import PadListCmp from './components/padList/padList.cmp';
import PadCmp from './components/pad/pad.cmp';
import ContextMenuCmp from './components/contextMenu/contextMenu.cmp';
import {UiState} from './common/uiState';
import Navigator from './common/navigator';
import {Scroller} from './common/scroller';

// Common styles
require('flexboxgrid/dist/flexboxgrid.css');
require('styles/main.less');

@Component({
    selector: 'app',
    directives: [ROUTER_DIRECTIVES, ContextMenuCmp],
    template: `
    <div class="app-container">
        <div className="header">Pad.</div>
        <context-menu></context-menu>
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
class AppComponent {

    constructor(private uiState: UiState) {}

    @HostListener('window:keydown', ['$event'])
    public keyHandler(event: KeyboardEvent) {
        this.uiState.keyHandler(event);
    }

    @HostListener('window:click', ['$event'])
    public clickHandler(event: MouseEvent) {
        this.uiState.blurSelectedItem();
    }
}

var defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'application/json');
class appRequestOptions extends BaseRequestOptions {
  headers = defaultHeaders;
}
bootstrap(AppComponent, [HTTP_PROVIDERS, provide(RequestOptions, {useClass: appRequestOptions}), UiState, Scroller, Navigator]);
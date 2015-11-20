// Bootstrapping module
import {Component, bootstrap, provide, bind, HostListener} from 'angular2/angular2';
// batarangle dependencies
import {AppViewListener} from 'angular2/src/core/linker/view_listener.js';
import {DebugElementViewListener, inspectNativeElement} from 'angular2/src/core/debug/debug_element_view_listener';

import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS, RequestOptions, BaseRequestOptions, Headers} from 'angular2/http';
import PadListCmp from './components/padList/padList.cmp';
import PadCmp from './components/pad/pad.cmp';
import ContextMenuCmp from './components/contextMenu/contextMenu.cmp';
import SearchBarCmp from './components/searchBar/searchBar.cmp';
import {UiState} from './common/uiState';
import Navigator from './common/navigator';
import DataService from './common/dataService';
import {Scroller} from './common/scroller';
import {Keyboard} from './common/keyboard';
import {PadService} from './common/padService';

// Common styles
require('flexboxgrid/dist/flexboxgrid.css');
require('styles/main.less');

@Component({
    selector: 'app',
    directives: [ROUTER_DIRECTIVES, ContextMenuCmp, SearchBarCmp],
    template: `
    <div class="app-container">
        <search-bar></search-bar>
        <context-menu></context-menu>
        <router-outlet></router-outlet>
    </div>`,
    providers: []
})
@RouteConfig([
    { path: '/', component: PadListCmp, as: 'PadList' },
    { path: '/pad/:id', component: PadCmp, as: 'Pad' }
])
class AppComponent {

    constructor(private uiState: UiState) {}

    @HostListener('window:keydown', ['$event'])
    public keyDownHandler(event: KeyboardEvent) {
        this.uiState.keydown(event);
    }

    @HostListener('window:keyup', ['$event'])
    public keyUpHandler(event: KeyboardEvent) {
        this.uiState.keyup(event);
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
bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    provide(LocationStrategy, {useClass: HashLocationStrategy}),
    provide(RequestOptions, {useClass: appRequestOptions}),
    // batarangle
    bind(AppViewListener).toClass(DebugElementViewListener),

    UiState,
    Scroller,
    DataService,
    PadService,
    Navigator,
    Keyboard]);
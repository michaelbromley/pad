import {Component, CORE_DIRECTIVES, FORM_DIRECTIVES, Input, Output, EventEmitter, ElementRef} from 'angular2/angular2';
//import {UiState, UiContext} from '../../common/uiState';
import {Type} from "../../common/model";
import {PadService} from "../../common/padService";
import {UiState} from "../../common/uiState";

@Component({
    selector: 'search-bar',
    template: require('./searchBar.cmp.html'),
    directives: [CORE_DIRECTIVES]
})
class SearchBarCmp {

    private focussed: boolean = false;

    constructor(private padService: PadService,
                private uiState: UiState,
                private elRef: ElementRef) {

        uiState.searchBarFocusChange().subscribe(val => {
            if (val) {
                this.focus(val);
            } else {
                this.blur();
            }
        });

        padService.change().subscribe(() => {
            if (!this.focussed) {
                this.clear();
            }
        });
    }

    public textChanged(event: Event) {
        let input = <HTMLInputElement>event.target;
        //this.padService.setFilterQuery(input.value);
    }

    private focus(keyCode?: number) {
        this.focussed = true;
        setTimeout(() => {
            let input = this.elRef.nativeElement.querySelector('input');
            if (typeof keyCode !== 'undefined') {
                input.value += String.fromCharCode(keyCode).toLowerCase();
            }
            input.focus();
        });
    }

    private blur() {
        this.focussed = false;
        setTimeout(() => {
            this.elRef.nativeElement.querySelector('input').blur();
        });
    }

    private clear() {
        this.elRef.nativeElement.querySelector('input').value = '';
    }
}

export default SearchBarCmp;
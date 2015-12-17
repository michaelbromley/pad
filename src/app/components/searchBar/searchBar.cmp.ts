import {Component, Input, Output, EventEmitter, ElementRef} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import * as Rx from 'rxjs';
import {Type} from "../../common/model";
import {PadService} from "../../common/padService";
import {UiState} from "../../common/uiState";
import {FilterService} from "../../common/filterService";

@Component({
    selector: 'search-bar',
    template: require('./searchBar.cmp.html'),
    directives: [CORE_DIRECTIVES]
})
class SearchBarCmp {

    private focussed: boolean = false;
    private input: HTMLInputElement;
    private subscriptions = [];

    constructor(private padService: PadService,
                private filterService: FilterService,
                private uiState: UiState,
                private elRef: ElementRef) {

        this.input = this.elRef.nativeElement.querySelector('input');

        let focusSub = uiState.searchBarFocusChangeEvent.subscribe(val => {
            if (val) {
                this.focus();
            } else {
                this.blur();
            }
        });

        let clearSub = Rx.Observable
            .merge(padService.changeEvent, filterService.clearFilterEvent)
            .subscribe(() => {
                if (!this.focussed) {
                    this.clear();
                }
            });

        this.subscriptions = [focusSub, clearSub];
    }

    ngOnDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    public textChanged(event: Event) {
        let input = <HTMLInputElement>event.target;
        this.filterService.setFilterTerm(input.value);
    }

    private focus() {
        this.focussed = true;
        setTimeout(() => this.input.focus());
    }

    private blur() {
        this.focussed = false;
        setTimeout(() => {
            this.input.blur();
        });
    }

    private clear() {
        this.input.value = '';
    }
}

export default SearchBarCmp;
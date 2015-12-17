import {Component} from 'angular2/core';
import {NgFor} from 'angular2/common';
import {RouterLink} from 'angular2/router';
import {UiState} from "../../common/uiState";
import DataService from "../../common/dataService";
import {PadService} from "../../common/padService";
import {FilterService} from "../../common/filterService";
import {Pad, ActionType} from "../../common/model";
import {PadHistory} from "../../common/padHistory";

@Component({
    selector: 'pad-list',
    template: require('./padList.cmp.html'),
    directives: [NgFor, RouterLink]
})
class PadListCmp {

    public pads: Pad[] = [];
    public filteredPads: Pad[] = [];
    private subscriptions: any[] = [];

    constructor(private dataService: DataService,
                private filterService: FilterService,
                private padService: PadService,
                private padHistory: PadHistory,
                private uiState: UiState) {

        this.filterService.clearFilter();
    }

    ngOnInit() {
        let changeSub = this.padService.changeEvent.subscribe(pad => {
            this.loadPads();
        });
        let filterSub = this.filterService.filterChangeEvent.subscribe(() => {
            this.loadPads();
        });
        this.subscriptions = [changeSub, filterSub];
        this.loadPads();
    }

    ngOnDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    private loadPads() {
        this.dataService.fetchPadList().subscribe(pads => {
            this.pads = pads;
            this.filteredPads = this.filterService.filterPadList(this.pads);
            this.uiState.initUiView(this.filteredPads);
            this.uiState.deselectAll();
        });
    }

    public checkSelected(uuid: string) {
        return this.uiState.itemIsSelected(uuid);
    }
}

export default PadListCmp;
import {Component, NgFor} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';
import {UiState} from "../../common/uiState";
import DataService from "../../common/dataService";
import {PadService} from "../../common/padService";
import {FilterService} from "../../common/filterService";
import {Pad} from "../../common/model";

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
                private uiState: UiState) {

        this.filterService.clearFilter();
    }

    onInit() {
        let changeSub = this.padService.changeEvent.subscribe(pad => {
            this.loadPads();
        });
        let filterSub = this.filterService.filterChangeEvent.subscribe(() => {
            this.loadPads();
        });
        this.subscriptions = [changeSub, filterSub];
        this.loadPads();
    }

    onDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    private loadPads() {
        this.dataService.fetchPadList().subscribe(pads => {
            this.pads = pads;
            this.filteredPads = this.filterService.filterPadList(pads);
            this.uiState.initUiView(this.filteredPads);
            this.uiState.deselectAll();
        });
    }

    public checkSelected(address) {
        return this.uiState.addressIsSelected(address);
    }
}

export default PadListCmp;
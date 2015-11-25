import {Component, NgFor} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';
import {UiState} from "../../common/uiState";
import DataService from "../../common/dataService";
import {PadService} from "../../common/padService";

@Component({
    selector: 'pad-list',
    template: require('./padList.cmp.html'),
    directives: [NgFor, RouterLink]
})
class PadListCmp {

    public pads: any[] = [];
    private subscriptions: any[] = [];

    constructor(private dataService: DataService,
                private padService: PadService,
                private uiState: UiState) {
    }

    onInit() {
        let sub = this.padService.changeEvent.subscribe(pad => {
            this.loadPads();
        });
        this.subscriptions.push(sub);

        this.loadPads();
    }

    onDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    private loadPads() {
        this.dataService.fetchPadList().subscribe(pads => {
            this.pads = pads;
            this.uiState.initUiView(pads);
            this.uiState.deselectAll();
        });
    }

    public checkSelected(address) {
        return this.uiState.addressIsSelected(address);
    }
}

export default PadListCmp;
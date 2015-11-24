import {Component, NgFor} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';
import {UiState} from "../../common/uiState";
import DataService from "../../common/dataService";

@Component({
    selector: 'pad-list',
    template: require('./padList.cmp.html'),
    directives: [NgFor, RouterLink]
})
class PadListCmp {

    public pads: any[] = [];

    constructor(private dataService: DataService, private uiState: UiState) {
    }

    onInit() {
        this.dataService.fetchPadList().subscribe(pads => {
            this.pads = pads;
            this.uiState.initUiView(pads);
        });
    }

    public checkSelected(address) {
        return this.uiState.addressIsSelected(address);
    }
}

export default PadListCmp;
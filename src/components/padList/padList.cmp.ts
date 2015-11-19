import {Component, NgFor} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';
import {UiState} from "../../common/uiState";
import {PadService} from "../../common/padService";

@Component({
    selector: 'pad-list',
    template: require('./padList.cmp.html'),
    directives: [NgFor, RouterLink]
})
class PadListCmp {

    public pads: any[] = [];
    private subscriptions = [];

    constructor(private padService: PadService, private uiState: UiState) {
        padService.loadPadList();

        let sub = padService.change().subscribe(() => {
            console.log('[padlist] change event');
            this.pads = padService.pads;
        });

        this.subscriptions.push(sub);
    }

    onDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    public checkSelected(address) {
        return this.uiState.addressIsSelected(address);
    }
}

export default PadListCmp;
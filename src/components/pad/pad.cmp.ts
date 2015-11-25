import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import TitleInputCmp from '../titleInput/titleInput.cmp';
import NoteEditorCmp from '../noteEditor/noteEditor.cmp';
import {UiState} from '../../common/uiState';
import {Type, Note, Pad, Page} from "../../common/model";
import {PadService} from "../../common/padService";
import {FilterService} from "../../common/filterService";

@Component({
    selector: 'pad',
    template: require('./pad.cmp.html'),
    directives: [CORE_DIRECTIVES, TitleInputCmp, NoteEditorCmp]
})
class PadCmp {

    public pad: Pad = <Pad>{};
    public filteredPad: Pad = <Pad>{};

    private subscriptions = [];

    constructor(private padService: PadService,
                private filterService: FilterService,
                private params: RouteParams,
                private uiState: UiState) {

        this.filterService.clearFilter();
    }

    onActivate() {
        this.padService.getPad(this.params.get('id'))
            .subscribe(pad => {
                this.loadPad(pad);
                this.uiState.deselectAll();
            });

        let changeSub = this.padService.changeEvent.subscribe(pad=> {
            this.loadPad(pad);
        });

        let filterSub = this.filterService.filterChangeEvent.subscribe(() => {
            this.filteredPad = this.filterService.filterPad(this.pad);
            this.uiState.initUiView(this.filteredPad);
        });

        this.subscriptions = [changeSub, filterSub];
    }

    private loadPad(pad: Pad) {
        this.pad = pad;
        this.filteredPad = this.filterService.filterPad(this.pad);
        this.uiState.initUiView(this.filteredPad);
    }

    onDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    public updateItem(item) {
        this.padService.updateItem(this.uiState.currentPadId, item);
    }

    public checkSelected(address) {
        return this.uiState.addressIsSelected(address);
    }
}

export default PadCmp;
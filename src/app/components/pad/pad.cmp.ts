import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import TitleInputCmp from '../titleInput/titleInput.cmp';
import NoteEditorCmp from '../noteEditor/noteEditor.cmp';
import {UiState, UiContext} from '../../common/uiState';
import {Type, Note, Pad, Page} from "../../common/model";
import {PadService} from "../../common/padService";
import {FilterService} from "../../common/filterService";
import {CollabService} from "../../common/collabService";
import {IUpdateObject} from "../../common/model";

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
                private collabService: CollabService,
                private filterService: FilterService,
                private params: RouteParams,
                private uiState: UiState) {

        this.filterService.clearFilter();
    }

    onInit() {
        this.padService.fetchPad(this.params.get('id'))
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

    public updateItem(updateObject: IUpdateObject) {
        this.padService.updateItem(updateObject);
    }

    public isSelected(uuid: string, isPageContainer: boolean) {
        if (isPageContainer) {
            return this.uiState.getUiContext() === UiContext.Pad && this.uiState.itemIsSelected(uuid);
        } else {
            return this.uiState.itemIsSelected(uuid);
        }
    }

    public isLocked(uuid: string) {
        return this.collabService.isItemLocked(uuid);
    }
}

export default PadCmp;
import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {RouteParams} from 'angular2/router';
import TitleInputCmp from '../titleInput/titleInput.cmp';
import NoteEditorCmp from '../noteEditor/noteEditor.cmp';
import {UiState, UiContext} from '../../common/uiState';
import {Type, Note, Pad, Page, IUpdateObject} from "../../common/model";
import {PadService} from "../../common/padService";
import {FilterService} from "../../common/filterService";
import {CollabService} from "../../common/collabService";
import {clone} from "../../common/utils";

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

    ngOnInit() {
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
        this.pad = clone(pad);
        this.filteredPad = this.filterService.filterPad(this.pad);
        this.uiState.initUiView(this.filteredPad);
    }

    ngOnDestroy() {
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
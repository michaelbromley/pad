import {Component, CORE_DIRECTIVES, FORM_DIRECTIVES, Input, Output, EventEmitter, ElementRef} from 'angular2/angular2';
import {UiState, UiContext} from '../../common/uiState';
import {types} from "../../common/model";

@Component({
    selector: 'context-menu',
    template: require('./contextMenu.cmp.html'),
    directives: [CORE_DIRECTIVES]
})
class ContextMenuCmp {

    constructor(private uiState: UiState) {

    }

    public newItemLabel() {
        let context = this.getContext();
        if (context === UiContext.PadList) {
            return 'New Pad';
        } else if (context === UiContext.Pad) {
            return 'New Page';
        } else {
            return 'New Note';
        }
    }

    public isPadContext() {
        return this.getContext() === UiContext.Pad;
    }

    public isPageContext() {
        return this.getContext() === UiContext.Page;
    }

    private getContext() {
        return this.uiState.getUiContext();
    }

    public createItem() {
        this.uiState.setCreate();
    }

    public deleteSelected() {
        this.uiState.setDeleteSelected();
    }

    public moveUp() {
        this.uiState.setReOrder(-1);
    }

    public moveDown() {
        this.uiState.setReOrder(1);
    }
}

export default ContextMenuCmp;
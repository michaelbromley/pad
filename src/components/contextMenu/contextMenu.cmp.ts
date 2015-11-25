import {Component, CORE_DIRECTIVES, FORM_DIRECTIVES, Input, Output, EventEmitter, ElementRef} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';
import {UiState, UiContext} from '../../common/uiState';
import {Type} from "../../common/model";
import {Action, ActionType} from "../../common/padService";

@Component({
    selector: 'context-menu',
    template: require('./contextMenu.cmp.html'),
    directives: [CORE_DIRECTIVES, RouterLink]
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

    public isPadContext(): boolean {
        return this.getContext() === UiContext.Pad;
    }

    public isPageContext(): boolean {
        return this.getContext() === UiContext.Page;
    }

    public isAnythingFocused() {
        return this.uiState.isCurrentAddressFocussed();
    }

    public canDelete(): boolean {
        return this.uiState.getAllowedOperations().remove;
    }

    public canMove(): boolean {
        return this.uiState.getAllowedOperations().move;
    }

    private getContext() {
        return this.uiState.getUiContext();
    }

    public focusSearchBar() {
        this.uiState.focusSearchBar();
    }

    public createItem() {
        this.uiState.createItem();
    }

    public deleteSelected() {
        this.uiState.deleteSelectedItem();
    }

    public moveUp() {
        this.uiState.moveItem(-1);
    }

    public moveDown() {
        this.uiState.moveItem(1);
    }

    public getHistory() {
        return this.uiState.getCurrentPadHistory().reverse();
    }

    public isCurrentState(index: number) {
        if (index === -1) {
            return this.uiState.getCurrentPadHistoryPointer() === -1;
        }
        let originalIndex = this.uiState.getCurrentPadHistory().length - 1 - index;
        return this.uiState.getCurrentPadHistoryPointer() === originalIndex;
    }

    public getActionDescription(action: Action): string {
        return ActionType[action.type].toLowerCase().replace('_', ' ');
    }
}

export default ContextMenuCmp;
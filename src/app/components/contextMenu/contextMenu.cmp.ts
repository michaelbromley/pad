import {Component, CORE_DIRECTIVES, FORM_DIRECTIVES, Input, Output, EventEmitter, ElementRef} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';
import {UiState, UiContext} from '../../common/uiState';
import {Type, Action, ActionType} from "../../common/model";
import {PadService} from "../../common/padService";
import {timeAgo} from '../../common/utils';
import SettingsPanelCmp from "../settingsPanel/settingsPanel";

@Component({
    selector: 'context-menu',
    template: require('./contextMenu.cmp.html'),
    directives: [CORE_DIRECTIVES, RouterLink, SettingsPanelCmp]
})
class ContextMenuCmp {

    private historyLength: number = 0;

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
        return this.getContext() !== UiContext.PadList;
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
        let history = this.uiState.getCurrentPadHistory().reverse();
        this.historyLength = history.length;
        return history;
    }

    public isCurrentState(index: number) {
        if (index === -1) {
            return this.uiState.getCurrentPadHistoryPointer() === -1;
        }
        let originalIndex = this.uiState.getCurrentPadHistory().length - 1 - index;
        return this.uiState.getCurrentPadHistoryPointer() === originalIndex;
    }

    public actionTime(timestamp: number) {
        return timeAgo(timestamp);
    }

    public jumpToHistory(index: number) {
        if (index === -1) {
            return this.uiState.jumpToHistory(-1);
        } else {
            let originalIndex = this.uiState.getCurrentPadHistory().length - 1 - index;
            return this.uiState.jumpToHistory(originalIndex);
        }
    }

    public getActionDescription(action: Action): string {
        return ActionType[action.type].toLowerCase().replace('_', ' ');
    }
}

export default ContextMenuCmp;
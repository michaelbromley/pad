import {Injectable, EventEmitter} from 'angular2/core';
import DataService from './dataService';
import {UiState, UiContext} from './uiState';
import {IPadItem, Page, Pad, Note, Type, Action, ActionType} from './model';
import {clone} from './utils';
import {CollabService} from "./collabService";
import {PadHistory} from "./padHistory";
import {IUpdateObject} from "./model";

/**
 * Service which keeps the state of the current pad and is responsible for creating new actions on the pad.
 */
@Injectable()
export class PadService {

    public changeEvent: EventEmitter<any> = new EventEmitter();
    private pad: Pad = <Pad>{};
    private emptyArray = [];

    constructor(private dataService: DataService,
                private padHistory: PadHistory,
                private collabService: CollabService) {

        collabService.action.subscribe((action: Action) => {
            this.prepareAndApply(action);
        })
    }

    public createPad() {
        let pad = new Pad();
        let titleAction = new Action(ActionType.UPDATE_PAD, pad.uuid);
        let title = 'Untitled Pad ' + pad.uuid.substr(0, 5);
        let patch = this.padHistory.createPatch(titleAction.uuid, '', title);
        titleAction.data = { patch: patch };
        pad.history.push(titleAction);
        pad = this.padHistory.applyAction(pad, pad.history[0]);
        pad.historyPointer = 0;

        return this.dataService.createPad(pad)
            .subscribe(pad => {
                this.pad = pad;
                this.changeEvent.emit(pad);
            });
    }

    public fetchPad(uuid: string) {
        return this.dataService.fetchPad(uuid)
            .map((pad: Pad) => {
                this.pad = pad;
                return this.pad;
            });

    }

    public getCurrentHistory(): Action[] {
        return this.pad.history ? this.pad.history : this.emptyArray;
    }

    public getCurrentHistoryPointer(): number {
        return this.pad.historyPointer;
    }

    public getItemByUuid(itemUuid: string): IPadItem {
        let pad = this.pad;
        if (pad) {
            let matchingPage = pad.pages.filter(page => page.uuid === itemUuid);
            if (matchingPage.length === 1) {
                return matchingPage[0];
            }
            let matchingNote = pad.pages
                .reduce((prev, curr)=> prev.concat(curr.notes), [])
                .filter(note => note.uuid === itemUuid);
            if (matchingNote.length === 1) {
                return matchingNote[0];
            }
        }
    }

    public createPage(index: number) {
        let action = new Action(ActionType.CREATE_PAGE, this.pad.uuid);
        let newPage = new Page();
        newPage.title = 'Untitled Page';
        action.data = {
            page: newPage,
            index: index
        };
        this.prepareAndApply(action);
        this.collabService.emitAction(action);
    }

    public createNote(pageUuid: string, index: number) {
        let action = new Action(ActionType.CREATE_NOTE, this.pad.uuid);
        let newNote = new Note();
        newNote.content = 'New Note';
        action.data = {
            note: newNote,
            pageUuid: pageUuid,
            index: index
        };
        this.prepareAndApply(action);
        this.collabService.emitAction(action);
    }

    public updateItem(update: IUpdateObject) {
        let item = update.item;
        let patch = this.padHistory.createPatch(item.uuid, update.oldVal, update.newVal);
        let actionType = item.type === Type.PAD ? ActionType.UPDATE_PAD :
                item.type === Type.PAGE ? ActionType.UPDATE_PAGE : ActionType.UPDATE_NOTE;
        let action = new Action(actionType, this.pad.uuid);

        action.data = { patch: patch };
        action.data.uuid = item.uuid;
        this.prepareAndApply(action);
        this.collabService.emitAction(action);
    }

    // TODO: refactor out all "pad list" type operations.
    public deletePad(padUuid: string) {
        this.dataService.deletePad(padUuid)
            .subscribe(() => this.changeEvent.emit({}));
    }

    public deleteItem(itemUuid: string) {
        let action;
        let item = this.getItemByUuid(itemUuid);

        switch (item.type) {
            case Type.PAGE:
                action = new Action(ActionType.DELETE_PAGE, this.pad.uuid);
                break;
            case Type.NOTE:
                action = new Action(ActionType.DELETE_NOTE, this.pad.uuid);
        }
        action.data = { uuid: item.uuid };
        this.prepareAndApply(action);
        this.collabService.emitAction(action);
    }

    public moveItem(increment: number, itemUuid: string) {
        let action;
        let item = this.getItemByUuid(itemUuid);

        switch (item.type) {
            case Type.PAGE:
                action = new Action(ActionType.MOVE_PAGE, this.pad.uuid);
                break;
            case Type.NOTE:
                action = new Action(ActionType.MOVE_NOTE, this.pad.uuid);
        }
        action.data = {
            uuid: item.uuid,
            increment: increment
        };
        this.prepareAndApply(action);
        this.collabService.emitAction(action);
    }

    /**
     * Push the action onto the history stack update the pointer and
     * apply the action to the workingPad.
     */
    private prepareAndApply(action: Action) {
        // remove any history actions that are after the current pointer position -
        // otherwise things get extremely messy. Essentially, whenever a new action is
        // created, it becomes the "head" of the history stack.
        // TODO: Disabled for now, since it has many complex implication when working
        // in a collaborative setting. For now, just push all new action onto the end
        // of the history stack for everyone.
        //this.pad.history = this.pad.history.slice(0, this.pad.historyPointer + 1);
        this.pad.history.push(action);
        this.pad = this.padHistory.applyAction(this.pad, action);
        this.pad.historyPointer = this.pad.history.length - 1;
        this.changeEvent.emit(this.pad);
        this.dataService.updatePad({
            uuid: this.pad.uuid,
            title: this.pad.title,
            pages: this.pad.pages,
            historyPointer: this.pad.historyPointer
        }).subscribe(() => {
            console.log('Updated pad.');
        });
    }

    public undo() {
        this.jumpToHistoryIndex(this.pad.historyPointer - 1);
    }

    public redo() {
        this.jumpToHistoryIndex(this.pad.historyPointer + 1);
    }

    public jumpToHistoryIndex(index: number) {
        if (-1 <= index && index < this.pad.history.length) {
            let delta = index - this.pad.historyPointer;
            let actions;
            if (delta < 0) {
                // undoing actions
                actions = this.pad.history.slice(0, index + 1);
                this.pad = this.reset(this.pad);
            } else {
                // redoing actions
                actions = this.pad.history.slice(this.pad.historyPointer + 1, index + 1);
            }
            this.pad = this.padHistory.applyActions(this.pad, actions);
            this.pad.historyPointer += delta;
            this.changeEvent.emit(this.pad);
        }
    }

    /**
     * Create a new pad equivalent to resetting a pad back to the state it was in when first created.
     */
    private reset(pad: Pad): Pad {
        let emptyPad = new Pad();
        emptyPad.uuid = pad.uuid;
        emptyPad.created = pad.created;
        emptyPad.history = pad.history;
        emptyPad.historyPointer = pad.historyPointer;
        return emptyPad;
    }
}
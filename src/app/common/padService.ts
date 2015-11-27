import {Injectable, EventEmitter} from 'angular2/angular2';
import DataService from './dataService';
import {UiState, UiContext} from './uiState';
import {IPadItem, Page, Pad, Note, Type, Action, ActionType} from './model';
import {clone} from './utils';
import {CollabService} from "./collabService";
import {PadHistory} from "./padHistory";

/**
 * Service which keeps the state of the current pad and is responsible for creating new actions on the pad.
 */
@Injectable()
export class PadService {

    public changeEvent: EventEmitter<any> = new EventEmitter();
    private pad: Pad = <Pad>{};
    private workingPad: Pad = <Pad>{};

    constructor(private dataService: DataService,
                private padHistory: PadHistory,
                private collabService: CollabService) {

        collabService.action.subscribe((action: Action) => {
            this.prepareAndApply(action);
        })
    }

    public createPad() {
        let pad = new Pad();
        pad.title = 'Untitled Pad ' + pad.uuid.substr(0, 5);
        return this.dataService.createPad(pad)
            .subscribe(pad => {
                this.pad = pad;
                this.workingPad = clone(pad);
                this.changeEvent.next(pad);
            });
    }

    public fetchPad(uuid: string) {
        return this.dataService.fetchPad(uuid)
            .map((pad: Pad) => {
                this.pad = pad;
                this.workingPad = this.padHistory.applyActions(pad, pad.history);
                return this.workingPad;
            });

    }

    public getCurrentHistory(): Action[] {
        return this.pad.history ? this.pad.history.slice(0) : [];
    }

    public getCurrentHistoryPointer(): number {
        return this.pad.historyPointer;
    }

    public getItemByUuid(itemUuid: string): IPadItem {
        let pad = this.workingPad;
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
            index: index + 1
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
            index: index + 1
        };
        this.prepareAndApply(action);
        this.collabService.emitAction(action);
    }

    public updateItem(item: IPadItem) {
        let action;
        switch (item.type) {
            case Type.PAD:
                action = new Action(ActionType.UPDATE_PAD, this.pad.uuid);
                action.data = { title: item.title };
                break;
            case Type.PAGE:
                action = new Action(ActionType.UPDATE_PAGE, this.pad.uuid);
                action.data = { title: item.title };
                break;
            case Type.NOTE:
                action = new Action(ActionType.UPDATE_NOTE, this.pad.uuid);
                action.data = { content: item.content };
        }
        action.data.uuid = item.uuid;
        this.prepareAndApply(action);
        this.collabService.emitAction(action);
    }

    // TODO: refactor out all "pad list" type operations.
    public deletePad(padUuid: string) {
        this.dataService.deletePad(padUuid)
            .subscribe(() => this.changeEvent.next({}));
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
        this.workingPad = this.padHistory.applyAction(this.workingPad, action);
        this.pad.historyPointer = this.pad.history.length - 1;
        this.changeEvent.next(this.workingPad);
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
                this.workingPad = clone(this.pad);
            } else {
                // redoing actions
                actions = this.pad.history.slice(this.pad.historyPointer + 1, index + 1);
            }
            this.workingPad = this.padHistory.applyActions(this.workingPad, actions);
            this.pad.historyPointer += delta;
            this.changeEvent.next(this.workingPad);
        }
    }
}
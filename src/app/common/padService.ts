import {Injectable, EventEmitter} from 'angular2/angular2';
let Rx = require('rx');
import DataService from './dataService';
import {UiState, UiContext} from './uiState';
import {IPadItem, Page, Pad, Note, Type, Action, ActionType} from './model';
import {clone} from './utils';
import {CollabService} from "./collabService";

/**
 * Service which keeps the state of the current pad and lists of pads. Should be the only component
 * to directly consume the dataService.
 *
 */
@Injectable()
export class PadService {

    public changeEvent: EventEmitter<any> = new EventEmitter();

    private pads: { [padUuid: string]: Pad } = {};
    private workingPads: { [padUuid: string]: Pad } = {};
    private history: { [padUuid: string]: Action[] } = {};
    private historyPointer: { [padUuid: string]: number; } = {};

    constructor(private dataService: DataService,
                private collabService: CollabService) {

        let actionSub = collabService.action.subscribe((action: Action) => {
            this.prepareAndApply(action.padUuid, action);
        })
    }

    public createPad() {
        let pad = new Pad();
        pad.title = 'Untitled Pad ' + pad.uuid;
        return this.dataService.createPad(pad)
            .subscribe(pad => {
                this.loadPadIntoMemory(pad);
                this.changeEvent.next(pad);
            });
    }

    public getPad(uuid: string) {
        if (!this.history[uuid]) {
            this.history[uuid] = [];
        }
        if (!this.workingPads[uuid]) {
            return this.dataService.fetchPad(uuid)
                .do((pad: Pad) => {
                    this.loadPadIntoMemory(pad);
                });
        } else {
            return Rx.Observable.of(this.workingPads[uuid]);
        }
    }

    public getHistory(padUuid: string): Action[] {
        let history =  this.history[padUuid];
        if (history) {
            return history.slice(0);
        } else {
            return [];
        }
    }

    public getHistoryPointer(padUuid: string): number {
        return this.historyPointer[padUuid];
    }

    private loadPadIntoMemory(pad: Pad) {
        this.pads[pad.uuid] = clone(pad);
        this.workingPads[pad.uuid] = clone(pad);
        this.historyPointer[pad.uuid] = -1;
    }

    public getItemByUuid(padUuid: string, itemUuid: string): IPadItem {
        let pad = this.workingPads[padUuid];
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

    public createPage(padUuid: string, index: number) {
        let action = new Action(ActionType.CREATE_PAGE, padUuid);
        let newPage = new Page();
        newPage.title = 'Untitled Page';
        action.data = {
            page: newPage,
            index: index
        };
        this.prepareAndApply(padUuid, action);
        this.collabService.emitAction(action);
    }

    public createNote(padUuid: string, pageUuid: string, index: number) {
        let action = new Action(ActionType.CREATE_NOTE, padUuid);
        let newNote = new Note();
        newNote.content = 'New Note';
        action.data = {
            note: newNote,
            pageUuid: pageUuid,
            index: index
        };
        this.prepareAndApply(padUuid, action);
        this.collabService.emitAction(action);
    }

    public updateItem(padUuid: string, item: IPadItem) {
        let action;
        switch (item.type) {
            case Type.PAD:
                action = new Action(ActionType.UPDATE_PAD, padUuid);
                action.data = { title: item.title };
                break;
            case Type.PAGE:
                action = new Action(ActionType.UPDATE_PAGE, padUuid);
                action.data = { title: item.title };
                break;
            case Type.NOTE:
                action = new Action(ActionType.UPDATE_NOTE, padUuid);
                action.data = { content: item.content };
        }
        action.data.uuid = item.uuid;
        this.prepareAndApply(padUuid, action);
        this.collabService.emitAction(action);
    }

    public deleteItem(padUuid: string, itemUuid?: string) {
        if (typeof itemUuid === 'undefined') {
            this.dataService.deletePad(padUuid)
                .subscribe(() => this.changeEvent.next({}));
        } else {
            let action;
            let item = this.getItemByUuid(padUuid, itemUuid);

            switch (item.type) {
                case Type.PAGE:
                    action = new Action(ActionType.DELETE_PAGE, padUuid);
                    break;
                case Type.NOTE:
                    action = new Action(ActionType.DELETE_NOTE, padUuid);
            }
            action.data = { uuid: item.uuid };
            this.prepareAndApply(padUuid, action);
            this.collabService.emitAction(action);
        }
    }

    public moveItem(padUuid: string, increment: number, itemUuid: string) {
        let action;
        let item = this.getItemByUuid(padUuid, itemUuid);

        switch (item.type) {
            case Type.PAGE:
                action = new Action(ActionType.MOVE_PAGE, padUuid);
                break;
            case Type.NOTE:
                action = new Action(ActionType.MOVE_NOTE, padUuid);
        }
        action.data = {
            uuid: item.uuid,
            increment: increment
        };
        this.prepareAndApply(padUuid, action);
        this.collabService.emitAction(action);
    }

    /**
     * Push the action onto the history stack update the pointer and
     * apply the action to the workingPad.
     */
    private prepareAndApply(padUuid: string, action: Action) {
        // remove any history actions that are after the current pointer position -
        // otherwise things get extremely messy. Essentially, whenever a new action is
        // created, it becomes the "head" of the history stack.
        this.history[padUuid] = this.history[padUuid].slice(0, this.historyPointer[padUuid] + 1);
        this.history[padUuid].push(action);
        this.workingPads[padUuid] = this.applyAction(this.workingPads[padUuid], action);
        this.historyPointer[padUuid] ++;
        this.dataService.updatePad(this.workingPads[padUuid]).subscribe(() => {
            console.log('saved changes');
        });
        this.changeEvent.next(this.workingPads[padUuid]);
    }

    public undo(padUuid: string) {
        this.jumpToHistoryIndex(padUuid, this.historyPointer[padUuid] - 1);
    }

    public redo(padUuid: string) {
        this.jumpToHistoryIndex(padUuid, this.historyPointer[padUuid] + 1);
    }

    public jumpToHistoryIndex(padUuid: string, index: number) {
        if (-1 <= index && index < this.history[padUuid].length) {
            let delta = index - this.historyPointer[padUuid];
            let actions;
            if (delta < 0) {
                // undoing actions
                actions = this.history[padUuid].slice(0, index + 1);
                this.workingPads[padUuid] = clone(this.pads[padUuid]);
            } else {
                // redoing actions
                actions = this.history[padUuid].slice(this.historyPointer[padUuid] + 1, index + 1);
            }
            for (let i = 0; i < actions.length; i++) {
                this.workingPads[padUuid] = this.applyAction(this.workingPads[padUuid], actions[i]);
            }
            this.historyPointer[padUuid] += delta;
            this.changeEvent.next(this.workingPads[padUuid]);
        }
    }

    /**
     * Given a pad and an action, applies the action and returns a new pad with that action applied.
     */
    private applyAction(pad: Pad, action: Action): Pad {
        let padClone: Pad = clone(pad);
        let getPageIndex = uuid => padClone.pages.map(page => page.uuid).indexOf(uuid);
        let pageIndex = -1, noteIndex = -1;
        let page, note, newIndex;

        switch (action.type) {
            case ActionType.CREATE_PAGE:
                padClone.pages.splice(action.data.index, 0, action.data.page);
                break;
            case ActionType.CREATE_NOTE:
                padClone.pages[getPageIndex(action.data.pageUuid)].notes.splice(action.data.index, 0, action.data.note);
                break;
            case ActionType.UPDATE_PAD:
                padClone.title = action.data.title;
                break;
            case ActionType.UPDATE_PAGE:
                padClone.pages[getPageIndex(action.data.uuid)].title = action.data.title;
                break;
            case ActionType.UPDATE_NOTE:
                [pageIndex, noteIndex] = this.getIndices(padClone, action.data.uuid);
                padClone.pages[pageIndex].notes[noteIndex].content = action.data.content;
                break;
            case ActionType.DELETE_PAGE:
                pageIndex = getPageIndex(action.data.uuid);
                padClone.pages.splice(pageIndex, 1);
                break;
            case ActionType.DELETE_NOTE:
                [pageIndex, noteIndex] = this.getIndices(padClone, action.data.uuid);
                padClone.pages[pageIndex].notes.splice(noteIndex, 1);
                break;
            case ActionType.MOVE_PAGE:
                pageIndex = getPageIndex(action.data.uuid);
                newIndex = pageIndex + action.data.increment;
                if (0 <= newIndex && newIndex < padClone.pages.length) {
                    page = padClone.pages.splice(pageIndex, 1)[0];
                    padClone.pages.splice(newIndex, 0, page);
                }
                break;
            case ActionType.MOVE_NOTE:
                [pageIndex, noteIndex] = this.getIndices(padClone, action.data.uuid);
                newIndex = noteIndex + action.data.increment;
                newIndex = noteIndex + action.data.increment;
                if (0 <= newIndex && newIndex < padClone.pages[pageIndex].notes.length) {
                    note = padClone.pages[pageIndex].notes.splice(noteIndex, 1)[0];
                    padClone.pages[pageIndex].notes.splice(noteIndex + action.data.increment, 0, note);
                }
                break;
        }

        return padClone;
    }

    /**
     * Given a pad and a noteUuid, this returns an array containing the index of the page which contains the
     * note, and the index of the note in that page.
     */
    private getIndices(pad: Pad, noteUuid: string): [number, number] {
        let pageIndex = -1;
        let noteIndex = -1;

        pad.pages.map((page: Page, index: number) => {
            let tempIndex = page.notes
                .map((note: Note, index: number) => note.uuid).indexOf(noteUuid);
            if (-1 < tempIndex) {
                pageIndex = index;
                noteIndex = tempIndex;
            }
        });
        return [pageIndex, noteIndex];
    }
}
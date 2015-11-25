import {Injectable, EventEmitter} from 'angular2/angular2';
let Rx = require('rx');
import DataService from './dataService';
import {UiState, UiContext} from './uiState';
import {IPadItem, Page, Pad, Note, Type} from './model';
import {clone} from './utils';

enum ActionType {
    CREATE_PAGE,
    CREATE_NOTE,
    UPDATE_PAD,
    UPDATE_PAGE,
    UPDATE_NOTE,
    DELETE_PAGE,
    DELETE_NOTE,
    MOVE_PAGE,
    MOVE_NOTE
}

class Action {
    uuid: string;
    type: ActionType;
    index: number;
    data: any;

    constructor(type: ActionType, index?: number) {
        this.type = type;
        if (typeof index !== 'undefined') {
            this.index = 0 < index ? index : 0;
        }
    }
}

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

    constructor(private dataService: DataService) {
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

    private loadPadIntoMemory(pad: Pad) {
        this.pads[pad.uuid] = pad;
        this.workingPads[pad.uuid] = pad;
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
        let action = new Action(ActionType.CREATE_PAGE, index);
        action.data = 'Untitled Page';
        this.prepareAndApply(padUuid, action);
    }

    public createNote(padUuid: string, pageUuid: string, index: number) {
        let action = new Action(ActionType.CREATE_NOTE, index);
        action.data = 'Untitled Note';
        action.uuid = pageUuid;
        this.prepareAndApply(padUuid, action);
    }

    public updateItem(padUuid: string, item: IPadItem) {
        let action;
        switch (item.type) {
            case Type.PAD:
                action = new Action(ActionType.UPDATE_PAD);
                action.data = item.title;
                break;
            case Type.PAGE:
                action = new Action(ActionType.UPDATE_PAGE);
                action.data = item.title;
                break;
            case Type.NOTE:
                action = new Action(ActionType.UPDATE_NOTE);
                action.data = item.content;
        }
        action.uuid = item.uuid;
        this.prepareAndApply(padUuid, action);
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
                    action = new Action(ActionType.DELETE_PAGE);
                    break;
                case Type.NOTE:
                    action = new Action(ActionType.DELETE_NOTE);
            }
            action.uuid = item.uuid;
            this.prepareAndApply(padUuid, action);
        }
    }

    public moveItem(padUuid: string, increment: number, itemUuid: string) {
        let action;
        let item = this.getItemByUuid(padUuid, itemUuid);

        switch (item.type) {
            case Type.PAGE:
                action = new Action(ActionType.MOVE_PAGE);
                break;
            case Type.NOTE:
                action = new Action(ActionType.MOVE_NOTE);
        }
        action.uuid = item.uuid;
        action.data = increment;
        this.prepareAndApply(padUuid, action);
    }

    /**
     * Push the action onto the history stack update the pointer and
     * apply the action to the workingPad.
     */
    private prepareAndApply(padUuid: string, action: Action) {
        this.history[padUuid].push(action);
        this.workingPads[padUuid] = this.applyAction(this.workingPads[padUuid], action);
        this.historyPointer[padUuid] ++;
        this.dataService.updatePad(this.workingPads[padUuid]).subscribe(() => {
            console.log('saved changes');
        });
        this.changeEvent.next(this.workingPads[padUuid]);
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
                let page = new Page();
                page.title = action.data;
                padClone.pages.splice(action.index, 0, page);
                break;
            case ActionType.CREATE_NOTE:
                let note = new Note();
                note.content = action.data;
                padClone.pages[getPageIndex(action.uuid)].notes.splice(action.index, 0, note);
                break;
            case ActionType.UPDATE_PAD:
                padClone.title = action.data;
                break;
            case ActionType.UPDATE_PAGE:
                padClone.pages[getPageIndex(action.uuid)].title = action.data;
                break;
            case ActionType.UPDATE_NOTE:
                [pageIndex, noteIndex] = this.getIndices(padClone, action.uuid);
                padClone.pages[pageIndex].notes[noteIndex].content = action.data;
                break;
            case ActionType.DELETE_PAGE:
                pageIndex = getPageIndex(action.uuid);
                padClone.pages.splice(pageIndex, 1);
                break;
            case ActionType.DELETE_NOTE:
                [pageIndex, noteIndex] = this.getIndices(padClone, action.uuid);
                padClone.pages[pageIndex].notes.splice(noteIndex, 1);
                break;
            case ActionType.MOVE_PAGE:
                pageIndex = getPageIndex(action.uuid);
                newIndex = pageIndex + action.data;
                if (0 <= newIndex && newIndex < padClone.pages.length) {
                    page = padClone.pages.splice(pageIndex, 1)[0];
                    padClone.pages.splice(newIndex, 0, page);
                }
                break;
            case ActionType.MOVE_NOTE:
                [pageIndex, noteIndex] = this.getIndices(padClone, action.uuid);
                newIndex = noteIndex + action.data;
                if (0 <= newIndex && newIndex < padClone.pages[pageIndex].notes.length) {
                    note = padClone.pages[pageIndex].notes.splice(noteIndex, 1)[0];
                    padClone.pages[pageIndex].notes.splice(noteIndex + action.data, 0, note);
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
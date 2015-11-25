import {Injectable, EventEmitter} from 'angular2/angular2';
let Rx = require('rx');
import DataService from './dataService';
import {UiState, UiContext} from "./uiState";
import {Page, Pad, Note, Type} from "./model";

enum ActionType {
    CREATE_PAGE,
    CREATE_NOTE,
    UPDATE_PAD,
    UPDATE_PAGE,
    UPDATE_NOTE
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

    public _change: EventEmitter = new EventEmitter();

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
                this.pads[pad.uuid] = pad;
            });
    }

    public getPad(uuid: string) {
        if (!this.history[uuid]) {
            this.history[uuid] = [];
        }
        if (!this.workingPads[uuid]) {
            return this.dataService.fetchPad(uuid)
                .do(pad => {
                    this.pads[uuid] = pad;
                    this.workingPads[uuid] = pad;
                    this.historyPointer[uuid] = -1;
                });
        } else {
            return Rx.Observable.of(this.workingPads[uuid]);
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

    public updateItem(padUuid: string, item: any) {
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
        this._change.next(this.workingPads[padUuid]);
    }

    /**
     * Given a pad and an action, applies the action and returns a new pad with that action applied.
     */
    private applyAction(pad: Pad, action: Action): Pad {
        let padClone: Pad = JSON.parse(JSON.stringify(pad));
        let getPageIndex = uuid => padClone.pages.map(page => page.uuid).indexOf(uuid);

        switch (action.type) {
            case ActionType.CREATE_PAGE:
                let page = new Page();
                page.title = action.data;
                padClone.pages.splice(action.index, 0, page);
                break;
            case ActionType.CREATE_NOTE:
                let note = new Note();
                note.content = action.data;
                let pageIndex = getPageIndex(action.uuid);
                padClone.pages[pageIndex].notes.splice(action.index, 0, note);
                break;
            case ActionType.UPDATE_PAD:
                padClone.title = action.data;
                break;
            case ActionType.UPDATE_PAGE:
                let pageIndex = getPageIndex(action.uuid);
                padClone.pages[pageIndex].title = action.data;
                break;
            case ActionType.UPDATE_NOTE:
                let [pageIndex, noteIndex] = this.getIndices(padClone, action.uuid);
                padClone.pages[pageIndex].notes[noteIndex].content = action.data;
                break;

        }

        return padClone;
    }

    /**
     * Given a pad and a noteUuid, this returns an array containing the index of the page which contains the
     * note, and the index of the note in that page.
     */
    private getIndices(pad: Pad, noteUuid: string): [number, number] {
        let pageIndex = noteIndex = -1;

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

    public change() {
        return this._change.toRx();
    }

}
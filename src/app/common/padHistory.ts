import {Pad, Page, Note, Action, ActionType} from "./model";
import {clone} from './utils';

/**
 * This service is responsible for applying actions to a pad to transform it from one history state into
 * another. All public methods operate on the pad in an immutable fashion, returning a new object with
 * transformations applied.
 */
export class PadHistory {

    /**
     * Apply an array of Actions to a Pad. Optionally specify an actionType filter to only apply
     * actions that match that type.
     */
    public applyActions(pad: Pad, actions: Action[], actionType?: ActionType): Pad {
        let actionsToApply = actions;
        let outputPad = pad;
        if (typeof actionType !== 'undefined') {
            actionsToApply = actions.filter(action => action.type === actionType);
        }
        for (let i = 0; i < actionsToApply.length; i++) {
            outputPad = this.applyAction(outputPad, actionsToApply[i]);
        }
        return outputPad;
    }

    /**
     * Given a pad and an action, applies the action and returns a new pad with that action applied.
     */
    public applyAction(pad: Pad, action: Action): Pad {
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
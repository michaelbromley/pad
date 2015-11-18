import {Injectable, EventEmitter} from 'angular2/angular2';
//import {} from 'angular2/router';
import Navigator from './navigator';
import {IPadItem, types, Page, Note} from "./model";

/**
 * These are the possible states the app can be in (i.e. at what level of the hierarchy is the user at)
 */
export enum UiContext {
    PadList,
    Pad,
    Page,
    Note
}

const Keys = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    enter: 13,
    escape: 27
};

@Injectable()
export class UiState {

    private _focus: EventEmitter = new EventEmitter();
    private _blur: EventEmitter = new EventEmitter();
    private _create: EventEmitter = new EventEmitter();
    private _deleteSelected: EventEmitter = new EventEmitter();

    private currentAddressIsFocussed: boolean = false;

    constructor(private navigator: Navigator) {
        console.log('constructing uiState');
    }

    public initPadCollection(padCollection) {
        this.navigator.init(padCollection);
    }

    public getUiContext(): UiContext {
        if (this.navigator.getSelectedItemAddress().length === 1) {
            return UiContext.Pad;
        } else {
            return UiContext.Page;
        }
        //return UiContext.PadList;
    }

    public addressIsSelected(address: number[]): boolean {
        return this.navigator.getSelectedItemAddress().toString() === address.toString();
    }

    public itemIsSelected(item: any): boolean {
        return this.navigator.getSelectedItemId() === item._id;
    }

    public keyHandler(event: KeyboardEvent) {

        if (!this.currentAddressIsFocussed) {
            switch (event.keyCode) {
                case Keys.up:
                    event.preventDefault();
                    this.navigator.prev();
                    break;
                case Keys.down:
                    event.preventDefault();
                    this.navigator.next();
                    break;
                case Keys.enter:
                    event.preventDefault();
                    let canGoDeeper = this.navigator.down();
                    if (!canGoDeeper) {
                        this.currentAddressIsFocussed = true;
                        this.fireFocusEvent();
                    }
                    break;
                case Keys.escape:
                    event.preventDefault();
                    this.navigator.up();
                    break;
                default:
            }
        } else {
            if (event.keyCode === Keys.escape) {
                event.preventDefault();
                this.blurSelectedItem();
            }
        }
        console.log(this.navigator.getSelectedItemAddress());
    }

    public blurSelectedItem() {
        if (this.currentAddressIsFocussed) {
            this.currentAddressIsFocussed = false;
            this.fireBlurEvent();
        }
    }

    public setCreate(type: string) {
        console.log('setCreate()');
        let newItem;
        if (type === types.PAGE) {
            newItem = new Page(this.navigator.getCurrentPadId());
            newItem.title = "Untitled Page";
            let currPageOrder = this.navigator.getSelectedItemAddress()[0];
            newItem.order = -1 < currPageOrder ? currPageOrder + 1 : 1;
        }
        if (type === types.NOTE) {
            newItem = new Note(this.navigator.getCurrentPageId());
            newItem.content = "Untitled Note";
        }
        this._create.next(newItem);
    }

    public setDeleteSelected() {
        let selectedItem = {
            _id: this.navigator.getSelectedItemId()
        };
        this._deleteSelected.next(selectedItem);
    }

    public setFocus(address: number[]) {
        this.navigator.setSelectedItemAddress(address);
        this.currentAddressIsFocussed = true;
        this.fireFocusEvent();
    }

    public unsetFocus() {
        this.currentAddressIsFocussed = false;
        this.fireBlurEvent();
    }

    public focus() {
        return this._focus.toRx();
    }

    public blur() {
        return this._blur.toRx();
    }

    public create() {
        return this._create.toRx();
    }

    public deleteSelected() {
        return this._deleteSelected.toRx();
    }

    private fireFocusEvent() {
        this._focus.next(this.navigator.getSelectedItemAddress().toString());
    }

    private fireBlurEvent() {
        this._blur.next(this.navigator.getSelectedItemAddress().toString());
    }

}
import {Injectable, EventEmitter} from 'angular2/angular2';
import {Router, Location} from 'angular2/router';
//import {} from 'angular2/router';
import Navigator from './navigator';
import {Scroller} from './scroller';
import {IPadItem, types, Pad, Page, Note} from "./model";
import {Keyboard} from "./keyboard";

/**
 * These are the possible states the app can be in (i.e. at what level of the hierarchy is the user at)
 */
export enum UiContext {
    PadList,
    Pad,
    Page,
    Note
}

@Injectable()
export class UiState {

    private _focus: EventEmitter = new EventEmitter();
    private _blur: EventEmitter = new EventEmitter();
    private _create: EventEmitter = new EventEmitter();
    private _deleteSelected: EventEmitter = new EventEmitter();
    private _reOrder: EventEmitter = new EventEmitter();

    private currentAddressIsFocussed: boolean = false;
    private lastPressedKeys: number[] = [];
    public currentPadId: string;
    private scroller;

    constructor(private router: Router,
                private location: Location,
                private navigator: Navigator,
                private keyboard: Keyboard) {
        // TODO: why does ng2 DI break when I try to inject this?
        this.scroller = new Scroller();
    }

    public initUiView(viewContents) {
        if (this.getUiContext() === UiContext.PadList) {
            this.currentPadId = undefined;
        } else {
            this.currentPadId = viewContents[0] && viewContents[0]._id;
        }
        this.navigator.init(viewContents);
    }

    public getUiContext(): UiContext {
        if (this.location.path() === '') {
            return UiContext.PadList;
        } else if (this.navigator.getSelectedItemAddress().length === 1) {
            return UiContext.Pad;
        } else {
            return UiContext.Page;
        }
    }

    public addressIsSelected(address: number[]): boolean {
        return this.navigator.getSelectedItemAddress().toString() === address.toString();
    }

    public itemIsSelected(item: any): boolean {
        return this.navigator.getSelectedItemId() === item._id;
    }

    public keydown(event: KeyboardEvent) {
        const isPressed = (...keys: string[]) => {
            return this.keyboard.isPressedOnly(...keys);
        };

        this.keyboard.keydown(event);

        let pressedKeys = this.keyboard.getPressedKeys();
        if (this.lastPressedKeys.toString() === pressedKeys.toString()) {
            return;
        }
        this.lastPressedKeys = pressedKeys;

        if (!this.currentAddressIsFocussed) {
            if (isPressed('up')) {
                event.preventDefault();
                this.navigator.prev();
            } else if (isPressed('down')) {
                event.preventDefault();
                this.navigator.next();
            } else if (isPressed('right')) {
                this.navigator.down();
            } else if (isPressed('enter')) {
                event.preventDefault();

                if (this.getUiContext() === UiContext.PadList) {
                    this.router.navigate(['Pad', { id: this.navigator.getSelectedItemId()}]);
                } else {
                    let canGoDeeper = this.navigator.down();
                    if (!canGoDeeper) {
                        this.currentAddressIsFocussed = true;
                        this.fireFocusEvent();
                    }
                }
            } else if (isPressed('left') || isPressed('esc')) {
                event.preventDefault();
                if (this.navigator.getSelectedItemAddress()[0] === -1) {
                    this.router.navigate(['PadList']);
                } else {
                    this.navigator.up();
                }
            } else if (isPressed('alt', 'ctrl', 'n')) {
                this.setCreate();
            } else if (isPressed('alt', 'ctrl', 'd')) {
                this.setDeleteSelected();
            } else if (isPressed('alt', 'ctrl', 'up')) {
                this.setReOrder(-1);
            } else if (isPressed('alt', 'ctrl', 'down')) {
                this.setReOrder(1);
            }
        } else {
            if (isPressed('esc')) {
                event.preventDefault();
                this.blurSelectedItem();
            }
        }
        this.scroller.scrollIntoView(this.navigator.getSelectedItemId());
    }

    public keyup(event: KeyboardEvent) {
        this.keyboard.keyup(event);
        this.lastPressedKeys = this.keyboard.getPressedKeys();
    }

    public selectNext() {
        this.navigator.next();
        this.scroller.scrollIntoView(this.navigator.getSelectedItemId());
    }

    public selectPrev() {
        this.navigator.prev();
        this.scroller.scrollIntoView(this.navigator.getSelectedItemId());
    }

    public blurSelectedItem() {
        if (this.currentAddressIsFocussed) {
            this.currentAddressIsFocussed = false;
            this.fireBlurEvent();
        }
    }

    public setCreate() {
        let newItem;
        let currentOrder;
        let context = this.getUiContext();

        if (context === UiContext.Pad) {
            newItem = new Page(this.navigator.getCurrentPadId());
            newItem.title = 'Untitled Page';
            currentOrder = this.navigator.getSelectedItemAddress()[0];
        } else if (context === UiContext.Page) {
            newItem = new Note(this.navigator.getCurrentPageId());
            newItem.content = 'Untitled Note';
            currentOrder = this.navigator.getSelectedItemAddress()[1];
        } else {
            newItem = new Pad();
            newItem.name = 'Untitled Pad';
            currentOrder = this.navigator.getSelectedItemAddress()[0];
        }

        newItem.order = -1 < currentOrder ? currentOrder + 1 : 1;
        this._create.next(newItem);
    }

    public setDeleteSelected() {
        let id = this.navigator.getSelectedItemId();
        if (id) {
            let selectedItem = {
                _id: this.navigator.getSelectedItemId()
            };
            this._deleteSelected.next(selectedItem);
        }
    }

    public setReOrder(increment: number) {
        let selectedItemId = this.navigator.getSelectedItemId();
        let type;

        if (this.getUiContext() === UiContext.PadList) {
            type = types.PAD;
        } else {
            type = this.navigator.getSelectedItemAddress().length === 1 ? types.PAGE : types.NOTE;
        }

        this._reOrder.next({
            type: type,
            id: selectedItemId,
            increment: increment
        });
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

    public reOrder() {
        return this._reOrder.toRx();
    }

    private fireFocusEvent() {
        this._focus.next(this.navigator.getSelectedItemAddress().toString());
    }

    private fireBlurEvent() {
        this._blur.next(this.navigator.getSelectedItemAddress().toString());
    }

}
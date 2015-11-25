import {Injectable, EventEmitter} from 'angular2/angular2';
import {Router, Location} from 'angular2/router';
//import {} from 'angular2/router';
import Navigator from './navigator';
import {Scroller} from './scroller';
import {Type, Pad, Page, Note} from "./model";
import {Keyboard} from "./keyboard";
import {PadService} from "./padService";

/**
 * These are the possible states the app can be in (i.e. at what level of the hierarchy is the user at)
 */
export enum UiContext {
    PadList,
    Pad,
    Page,
    Note
}

/**
 * Defines the operations which may be performed on a selected item.
 */
export interface IAllowedOperations {
    remove: boolean;
    move: boolean;
}

@Injectable()
export class UiState {

    public focusEvent: EventEmitter<string> = new EventEmitter();
    public searchBarFocusChangeEvent: EventEmitter<number> = new EventEmitter();
    public blurEvent: EventEmitter<string> = new EventEmitter();
    public createEvent: EventEmitter<any> = new EventEmitter();
    public deleteSelectedEvent: EventEmitter<any> = new EventEmitter();
    public reOrderEvent: EventEmitter<any> = new EventEmitter();

    private currentAddressIsFocused: boolean = false;
    private searchBarIsFocused: boolean = false;
    private lastPressedKeys: number[] = [];
    public currentPadId: string;
    private scroller;

    constructor(private router: Router,
                private location: Location,
                private padService: PadService,
                private navigator: Navigator,
                private keyboard: Keyboard) {
        // TODO: why does ng2 DI break when I try to inject this?
        this.scroller = new Scroller();
    }

    public initUiView(viewContents) {
        if (viewContents instanceof Array) {
            this.currentPadId = undefined;
            this.navigator.initPadList(viewContents);
        } else {
            this.currentPadId = viewContents.uuid;
            this.navigator.initPad(viewContents);
        }
        this.deselectAll();
    }

    public updateUiView(viewContents) {
        this.navigator.initPad(viewContents);
    }

    public deselectAll() {
        this.navigator.deselectAll();
    }

    public getUiContext(): UiContext {
        if (this.location.path() === '') {
            return UiContext.PadList;
        }  else if (this.navigator.getSelectedItemAddress().length === 1) {
            return UiContext.Pad;
        } else {
            return UiContext.Page;
        }
    }

    public addressIsSelected(address: number[]): boolean {
        return this.navigator.getSelectedItemAddress().toString() === address.toString();
    }

    public itemIsSelected(item: any): boolean {
        return this.navigator.getSelectedItemId() === item.uuid;
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

        if (!this.currentAddressIsFocused && !this.searchBarIsFocused) {
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
                    this.router.navigate(['Pad', {id: this.navigator.getSelectedItemId()}]);
                } else {
                    let canGoDeeper = this.navigator.down();
                    if (!canGoDeeper) {
                        this.currentAddressIsFocused = true;
                        this.fireFocusEvent();
                    }
                }
            } else if (isPressed('left')) {
                event.preventDefault();
                this.navigator.up();
            } else if (isPressed('esc')) {
                event.preventDefault();
                if (this.navigator.getSelectedItemAddress()[0] === -1) {
                    this.router.navigate(['PadList']);
                } else {
                    this.navigator.up();
                }
            } else if (isPressed('alt', 'ctrl', 'n')) {
                this.createItem();
            } else if (isPressed('alt', 'ctrl', 'd')) {
                if (this.getAllowedOperations().remove) {
                    this.setDeleteSelected();
                }
            } else if (isPressed('alt', 'ctrl', 'up')) {
                if (this.getAllowedOperations().move) {
                    this.setReOrder(-1);
                }
            } else if (isPressed('alt', 'ctrl', 'down')) {
                if (this.getAllowedOperations().move) {
                    this.setReOrder(1);
                }
            } else {
                if (this.keyboard.isPrintableChar(event.keyCode)) {
                    this.focusSearchBar(event.keyCode);
                }
            }
        } else {
            if (isPressed('esc')) {
                event.preventDefault();
                this.blurSelectedItem();
                this.blurSearchBar();
            }
            if (isPressed('down')) {
                this.blurSearchBar();
            }
        }
        this.scroller.scrollIntoView(this.navigator.getSelectedItemId());
    }

    private focusSearchBar(keyCode: number) {
        this.blurSelectedItem();
        this.navigator.deselectAll();
        this.searchBarIsFocused = true;
        this.searchBarFocusChangeEvent.next(keyCode);
    }

    private blurSearchBar() {
        if (this.searchBarIsFocused) {
            this.searchBarIsFocused = false;
            this.searchBarFocusChangeEvent.next(undefined);
        }
    }

    public keyup(event: KeyboardEvent) {
        this.keyboard.keyup(event);
        this.lastPressedKeys = this.keyboard.getPressedKeys();
    }

    public getSelectedItemId() {
        return this.navigator.getSelectedItemId();
    }

    public getAllowedOperations(): IAllowedOperations {
        let allowed: IAllowedOperations = {
            remove: false,
            move: false
        };
        let context = this.getUiContext();
        let somethingIsSelected = this.navigator.getSelectedItemId() !== '';

        if (!somethingIsSelected) {
            return allowed;
        }

        if (context === UiContext.PadList) {
            if (somethingIsSelected) {
                allowed.remove = true;
                allowed.move = true;
            }
        } else if (context === UiContext.Pad) {
            if (this.navigator.getSelectedItemAddress()[0] !== 0) {
                allowed.remove = true;
                allowed.move = true;
            }
        } else if (context === UiContext.Page) {
            if (this.navigator.getSelectedItemAddress()[1] !== 0) {
                allowed.remove = true;
                allowed.move = true;
            }
        }

        return allowed;
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
        if (this.currentAddressIsFocused) {
            this.currentAddressIsFocused = false;
            this.fireBlurEvent();
        }
    }

    public createItem() {
        let context = this.getUiContext();

        if (context === UiContext.Pad) {
            this.padService.createPage(this.currentPadId, this.navigator.getSelectedItemAddress()[0]);
        } else if (context === UiContext.Page) {
            this.padService.createNote(this.currentPadId, this.navigator.getCurrentPageId(), this.navigator.getSelectedItemAddress()[0])
        } else {
            this.padService.createPad();
        }

    }

    public setDeleteSelected() {
        let id = this.navigator.getSelectedItemId();
        if (id) {
            let selectedItem = {
                _id: this.navigator.getSelectedItemId()
            };
            this.deleteSelectedEvent.next(selectedItem);
        }
    }

    public setReOrder(increment: number) {
        let selectedItemId = this.navigator.getSelectedItemId();
        let type;

        if (this.getUiContext() === UiContext.PadList) {
            type = Type.PAD;
        } else {
            type = this.navigator.getSelectedItemAddress().length === 1 ? Type.PAGE : Type.NOTE;
        }

        this.reOrderEvent.next({
            type: type,
            id: selectedItemId,
            increment: increment
        });
    }

    public setFocus(address: number[]) {
        this.navigator.setSelectedItemAddress(address);
        this.currentAddressIsFocused = true;
        this.fireFocusEvent();
    }

    public isCurrentAddressFocussed() {
        return this.currentAddressIsFocused;
    }

    public unsetFocus() {
        this.currentAddressIsFocused = false;
        this.fireBlurEvent();
    }

    private fireFocusEvent() {
        this.focusEvent.next(this.navigator.getSelectedItemAddress().toString());
    }

    private fireBlurEvent() {
        this.blurEvent.next(this.navigator.getSelectedItemAddress().toString());
    }

}
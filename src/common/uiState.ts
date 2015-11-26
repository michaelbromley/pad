import {Injectable, EventEmitter} from 'angular2/angular2';
import {Router, Location} from 'angular2/router';
//import {} from 'angular2/router';
import Navigator from './navigator';
import {Scroller} from './scroller';
import {Type, Pad, Page, Note} from "./model";
import {Keyboard} from "./keyboard";
import {PadService, Action} from "./padService";
import {IPadItem} from "./model";

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
    public searchBarFocusChangeEvent: EventEmitter<boolean> = new EventEmitter();
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

        this.registerKeyboardShortcuts();
    }

    public initUiView(viewContents) {
        if (viewContents instanceof Array) {
            this.currentPadId = undefined;
            this.navigator.initPadList(viewContents);
        } else {
            this.currentPadId = viewContents.uuid;
            this.navigator.initPad(viewContents);
        }
    }

    public registerKeyboardShortcuts() {
        this.keyboard.registerShortcut(['up'], event => {
            this.navigator.prev();
            if (this.navigator.nothingSelected()) {
                this.deselectAll();
            }
        }, true);
        this.keyboard.registerShortcut(['down'], event => {
            this.navigator.next();
            if (this.navigator.nothingSelected()) {
                this.deselectAll();
            }
        }, true);
        this.keyboard.registerShortcut(['right'], event => this.navigator.down());
        this.keyboard.registerShortcut(['left'], event => this.navigator.up(), true);
        this.keyboard.registerShortcut(['enter'], event => {
            if (this.getUiContext() === UiContext.PadList) {
                this.router.navigate(['Pad', {id: this.navigator.getSelectedItemId()}]);
            } else {
                let canGoDeeper = this.navigator.down();
                if (!canGoDeeper) {
                    this.currentAddressIsFocused = true;
                    this.fireFocusEvent();
                }
            }
        }, true);
        this.keyboard.registerShortcut(['esc'], event => {
            if (this.navigator.nothingSelected()) {
                this.router.navigate(['PadList']);
            } else {
                this.navigator.up();
            }
        }, true);
        this.keyboard.registerShortcut(['alt', 'ctrl', 's'], event => this.focusSearchBar());
        this.keyboard.registerShortcut(['alt', 'ctrl', 'n'], event => this.createItem());
        this.keyboard.registerShortcut(['alt', 'ctrl', 'd'], event => {
            if (this.getAllowedOperations().remove) {
                this.deleteSelectedItem();
            }
        });
        this.keyboard.registerShortcut(['alt', 'ctrl', 'up'], event => {
            if (this.getAllowedOperations().move) {
                this.moveItem(-1);
            }
        });
        this.keyboard.registerShortcut(['alt', 'ctrl', 'down'], event => {
            if (this.getAllowedOperations().move) {
                this.moveItem(1);
            }
        });
        this.keyboard.registerShortcut(['alt', 'ctrl', 'z'], event => {
            this.navigator.deselectAll();
            this.padService.undo(this.currentPadId);
        }, true);
        this.keyboard.registerShortcut(['alt', 'ctrl', 'shift', 'z'], event => {
            this.navigator.deselectAll();
            this.padService.redo(this.currentPadId);
        }, true);
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

    public itemIsSelected(item: IPadItem): boolean {
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
            this.keyboard.checkShortcuts(event);
        } else {
            if (isPressed('esc')) {
                event.preventDefault();
                this.blurSelectedItem();
                this.blurSearchBar();
            }
            if (isPressed('down')) {
                this.blurSearchBar();
                this.navigator.next();
            }
        }
        this.scroller.scrollIntoView(this.navigator.getSelectedItemId());
    }

    public focusSearchBar() {
        this.searchBarIsFocused = true;
        this.searchBarFocusChangeEvent.next(true);
    }

    private blurSearchBar() {
        if (this.searchBarIsFocused) {
            this.searchBarIsFocused = false;
            this.searchBarFocusChangeEvent.next(false);
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
                allowed.move = false;
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

    public deleteSelectedItem() {
        if (this.getUiContext() === UiContext.PadList) {
            this.padService.deleteItem(this.getSelectedItemId());
        } else {
            let itemUuid = this.navigator.getSelectedItemId();
            if (itemUuid) {
                this.padService.deleteItem(this.currentPadId, itemUuid);
            }
        }
    }

    public moveItem(increment: number) {
        if (this.getUiContext() !== UiContext.PadList) {
            let selectedItemId = this.navigator.getSelectedItemId();
            this.padService.moveItem(this.currentPadId, increment, selectedItemId);
            if (0 < increment) {
                this.navigator.next();
            } else {
                this.navigator.prev();
            }
        }
    }

    public jumpToHistory(index) {
        this.padService.jumpToHistoryIndex(this.currentPadId, index);
    }

    public setFocus(address: number[]) {
        this.navigator.setSelectedItemAddress(address);
        this.currentAddressIsFocused = true;
        this.fireFocusEvent();
    }

    public isCurrentAddressFocussed() {
        return this.currentAddressIsFocused;
    }

    public getCurrentPadHistory(): Action[] {
        return this.padService.getHistory(this.currentPadId);
    }

    public getCurrentPadHistoryPointer(): number {
        return this.padService.getHistoryPointer(this.currentPadId);
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
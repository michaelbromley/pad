import {Injectable, EventEmitter} from 'angular2/angular2';
import Navigator from './navigator';


const Keys = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    enter: 13,
    escape: 27
};

@Injectable()
class UiState {

    private _focus: EventEmitter = new EventEmitter();
    private _blur: EventEmitter = new EventEmitter();
    private currentAddressIsFocussed: boolean = false;

    constructor(private navigator: Navigator) {
        console.log('constructing uiState');
    }

    public initPadCollection(padCollection) {
        this.navigator.init(padCollection);
    }

    public addressIsSelected(address: number[]): boolean {
        return this.navigator.getSelectedItemAddress().toString() === address.toString();
    }

    public keyHandler(event: KeyboardEvent) {

        if (!this.currentAddressIsFocussed) {
            switch (event.keyCode) {
                case Keys.up:
                    this.navigator.prev();
                    break;
                case Keys.down:
                    this.navigator.next();
                    break;
                case Keys.enter:
                    let canGoDeeper = this.navigator.down();
                    if (!canGoDeeper) {
                        this.currentAddressIsFocussed = true;
                        this.fireFocusEvent();
                    }
                    break;
                case Keys.escape:
                    this.navigator.up();
                    break;
                default:
            }
        } else {
            if (event.keyCode === Keys.escape) {
                this.currentAddressIsFocussed = false;
                this.fireBlurEvent();
            }
        }
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

    private fireFocusEvent() {
        this._focus.next(this.navigator.getSelectedItemAddress().toString());
    }

    private fireBlurEvent() {
        this._blur.next(this.navigator.getSelectedItemAddress().toString());
    }

}

export default UiState;
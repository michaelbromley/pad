import {Observable} from 'angular2/angular2';
import * as navigator from './navigator';


const Keys = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    enter: 13,
    escape: 27
};

class UiState {

    constructor() {

    }

    public keyHandler(event: KeyboardEvent) {

        switch (event.keyCode) {
            case Keys.up:
                navigator.prev();
                break;
            case Keys.down:
                navigator.next();
                break;
            case Keys.enter:
                navigator.down();
                break;
            case Keys.escape:
                navigator.up();
                break;
            default:
        }
    }

}

export default new UiState();
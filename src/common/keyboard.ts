
/**
 * Create a map object { name: keyCode }
 * Code borrowed from https://github.com/timoxley/keycode
 */
function createCodeMap() {
    let codes = {
        'backspace': 8,
        'tab': 9,
        'enter': 13,
        'shift': 16,
        'ctrl': 17,
        'alt': 18,
        'pause/break': 19,
        'caps lock': 20,
        'esc': 27,
        'space': 32,
        'page up': 33,
        'page down': 34,
        'end': 35,
        'home': 36,
        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40,
        'insert': 45,
        'delete': 46,
        'command': 91,
        'right click': 93,
        'numpad *': 106,
        'numpad +': 107,
        'numpad -': 109,
        'numpad .': 110,
        'numpad /': 111,
        'num lock': 144,
        'scroll lock': 145,
        'my computer': 182,
        'my calculator': 183,
        ';': 186,
        '=': 187,
        ',': 188,
        '-': 189,
        '.': 190,
        '/': 191,
        '`': 192,
        '[': 219,
        '\\': 220,
        ']': 221,
        "'": 222,
    };

    // lower case chars
    for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

    // numbers
    for (var i = 48; i < 58; i++) codes[i - 48] = i

    // function keys
    for (i = 1; i < 13; i++) codes['f'+i] = i + 111

    // numpad keys
    for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

    return codes;
}


/**
 * Service for handling keyboard shortcuts.
 */
export class Keyboard {

    private pressed: boolean[] = [];
    private timeout: number;
    private codesMap;

    constructor() {
        this.codesMap = createCodeMap();
    }

    public keydown(event: KeyboardEvent) {
        this.pressed[event.keyCode] = true;
        this.clearKeyUpTimeout();
        this.setKeyUpTimeout();

    }

    public keyup(event: KeyboardEvent) {
        this.pressed[event.keyCode] = false;
        this.clearKeyUpTimeout();
    }

    private setKeyUpTimeout() {
        this.timeout = <any>setTimeout(() => {
            this.pressed = this.pressed.map(() => false);
        }, 500);
    }

    private clearKeyUpTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    /**
     * Accepts a variable number of key names (e.g. 'control', 'shift', 'n')
     * and returns true if those and only those keys are currently being pressed.
     */
    public isPressedOnly(...keyNames: string[]): boolean {
        let result = true;
        let invalidKeyNames = [];
        let pressed = Object.keys(this.pressed).filter(code => this.pressed[code]).map(str => parseInt(str));

        if (pressed.length !== keyNames.length) {
            return false;
        }

        keyNames.forEach(name => {
            if (this.codesMap[name]) {
                if (pressed.indexOf(this.codesMap[name]) === -1) {
                    result = false;
                }
            } else {
                invalidKeyNames.push(name);
            }
        });

        if (0 < invalidKeyNames.length) {
            throw new Error('Keyboard#isPressedOnly(): The following key names are invalid:' + invalidKeyNames.toString());
        }
        return result;
    }

    /**
     * Returns true if the keyCode corresponds to a printable character (not a control key).
     * Based on http://stackoverflow.com/a/12467610/772859
     */
    public isPrintableChar(keyCode: number): boolean {
        var valid =
            (keyCode > 47 && keyCode < 58)   || // number keys
            (keyCode > 64 && keyCode < 91)   || // letter keys
            (keyCode > 95 && keyCode < 112)  || // numpad keys
            (keyCode > 185 && keyCode < 193) || // ;=,-./` (in order)
            (keyCode > 218 && keyCode < 223);   // [\]' (in order)

        return valid;
    }

    /**
     * Get an array of the pressed key codes
     */
    public getPressedKeys(): number[] {
        return Object.keys(this.pressed).filter(code => this.pressed[code]).map(str => parseInt(str));
    }
}
import {Injectable} from 'angular2/angular2';
import {Type} from './model';
import {Pad} from "./model";
import {Page} from "./model";
import {Note} from "./model";

const NONE = -1; // value to show that nothing is selected

/**
 * The Navigator is responsible for keeping a pointer to a particular address in a padCollection. This allows
 * an abstracted way to navigate around the padCollection, and allows us to query the "selected" address at
 * any time.
 */
@Injectable()
class Navigator {
    private selectedItemAddress: number[] = [NONE];
    // a nested array containing item uuids, reflecting
    // the UI layout.
    private collectionMap: string[][];
    // A mapping of item uuid to address - the inverse of the collectionMap.
    private inverseMap: { [uuid: string]: number[] };

    constructor() {}
    
    public initPad(viewContents: Pad) {
        this.collectionMap = this.buildPadMap(viewContents);
        this.inverseMap = this.buildInversePadMap(viewContents);
    }

    public initPadList(viewContents: Pad[]) {
        this.collectionMap = this.buildPadListMap(viewContents);
    }
    
    public getSelectedItemAddress() {
        return this.selectedItemAddress;
    }

    /**
     * Returns the ID of the selected item, or an empty string if nothing is currently selected.
     */
    public getSelectedItemId(): string {
       return this.getItemIdAtAddress(this.selectedItemAddress);
    }

    public getCurrentPageId(): string {
        if (1 < this.selectedItemAddress.length) {
            let parentAddress = this.selectedItemAddress.slice(0);
            parentAddress.pop();
            return this.getItemIdAtAddress(parentAddress);
        }
    }

    public getCurrentPadId() {
        return this.getItemIdAtAddress([0]);
    }

    private getItemIdAtAddress(address: number[]): string {
        let val = this.getValue(this.collectionMap, address),
            unwrap = (val) => typeof val === 'string' || typeof val === 'undefined' ? val : unwrap(val[0]);

        if (typeof val === 'undefined') {
            return '';
        }
        return unwrap(val);
    }

    public setSelectedItem(uuid: string) {
        this.selectedItemAddress = this.inverseMap[uuid];
    }

    public nothingSelected(): boolean {
        return this.selectedItemAddress[0] === NONE;
    }

    public deselectAll() {
        this.selectedItemAddress = [NONE];
    }

    /**
     * Go down one level of the tree. Returns true if a deeper level was found,
     * and false if we are already at the deepest level.
     */
    public down(): boolean {
        let downAddress = this.selectedItemAddress.slice();
        downAddress.push(0);
        let objectAtAddress = this.getValue(this.collectionMap, downAddress);
        if (objectAtAddress instanceof Array) {
            this.selectedItemAddress = downAddress;
            return true;
        } else {
            return false;
        }
    }

    public up() {
        if (1 === this.selectedItemAddress.length) {
            this.selectedItemAddress[0] = NONE;
        } else {
            this.selectedItemAddress.pop();
        }

    }
    
    public prev = () => {
        if (this.selectedItemAddress[0] === NONE) {
            this.selectedItemAddress = this.getLastItemAddress();
        } else {
            let prevAddress = this.decrementLast(this.selectedItemAddress);
            if (this.getValue(this.collectionMap, prevAddress)) {
                this.selectedItemAddress = prevAddress;
            } else {
                this.up();
            }
        }
    };
    
    public next = () => {
        let nextAddress = this.incrementLast(this.selectedItemAddress);
        let objectAtAddress = this.getValue(this.collectionMap, nextAddress);
        if (objectAtAddress instanceof Array && objectAtAddress[0]) {
            this.selectedItemAddress = nextAddress;
        } else {
            this.up();
        }
    };

    private getLastItemAddress() {
        return [this.collectionMap.length - 1];
    }
    
    /**
     * Increment the last element in an array of numbers, and return a new array.
     */
    private incrementLast(array: number[]): number[] {
        return array.map((num, i, arr) => {
                return num + +(i === arr.length - 1);
            }
        );
    }
    
    private decrementLast(array: number[]): number[] {
        return array.map((num, i, arr) => {
                return num - +(i === arr.length - 1);
            }
        );
    }
    
    private getValue(array: string[][], address: number[]): any {
        let val: any = array;
        address.forEach(index => {
            if (val instanceof Array) {
                val = val[index];
            } else {
                val = undefined;
            }
        });
        return val;
    }
    
    private buildPadMap(pad: Pad): any[][] {
        let map = [];
        let pages = pad.pages.map((page: Page) => {
            return [[page.uuid]].concat(page.notes.map((note: Note) => [note.uuid]));
        });
        map[0] = [pad.uuid];
        map = map.concat(pages);
        return map;
    }

    private buildInversePadMap(pad: Pad): { [uuid: string]: number[] } {
        let map = {};
        map[pad.uuid] = [0];
        pad.pages.forEach((page, index) => {
            let pageIndex = index + 1;
            map[page.uuid] = [pageIndex, 0];
            page.notes.forEach((note, noteIndex) => {
                map[note.uuid] = [pageIndex, noteIndex + 1];
            });
        });
        return map;
    }

    private buildPadListMap(padList: Pad[]): string[][] {
        return padList.map(pad => {
            return [pad.uuid];
        });
    }
}

export default Navigator;

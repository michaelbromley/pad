import {Injectable} from 'angular2/angular2';
import {types} from './model';

const NONE = -1; // value to show that nothing is selected

/**
 * The Navigator is responsible for keeping a pointer to a particular address in a padCollection. This allows
 * an abstracted way to navigate around the padCollection, and allows us to query the "selected" address at
 * any time.
 */
@Injectable()
class Navigator {
    private selectedItemAddress: number[] = [NONE];
    private collectionMap: number[];

    constructor() {
        console.log('constructing navigator instance!');
    }
    
    public init(padCollection: any[]) {
        this.collectionMap = this.buildMap(padCollection);
    }
    
    public getSelectedItemAddress() {
        return this.selectedItemAddress;
    }

    public setSelectedItemAddress(newAddress: number[]) {
        if (this.getValue(this.collectionMap, newAddress)) {
            this.selectedItemAddress = newAddress;
        } else {
            throw new Error(`Navigator#setSelectedItemAddress: address ${newAddress} does not exist.`);
        }
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
        if (this.getValue(this.collectionMap, downAddress)) {
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
        if (this.getValue(this.collectionMap, nextAddress)) {
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
    
    private getValue(array: number[], address: number[]): any {
        let val: any = array;
        address.forEach(index => {
            if (val instanceof Array) {
                val = val[index];
            }
        });
        return val;
    }
    
    private buildMap(collection: any[]): number[] {
        let map = [],
            lastPage = [];
        for (let i = 0; i < collection.length; i ++) {
            let item = collection[i];
            if (item.type === types.PAGE) {
                if (0 < lastPage.length) {
                    map.push(lastPage);
                }
                lastPage = [[]];
            } else if (item.type === types.NOTE) {
                lastPage.push([]);
            } else if (item.type === types.PAD) {
                map.push([]);
            }
        }
        map.push(lastPage);
        return map;
    }
}

export default Navigator;
    
    


    
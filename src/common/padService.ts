import {Injectable, EventEmitter} from 'angular2/angular2';
import DataService from './dataService';
import {UiState, UiContext} from "./uiState";
import {Page, Pad, Note, types} from "./model";
import PadCmp from "../components/pad/pad.cmp";


/**
 * Service which keeps the state of the current pad and lists of pads. Should be the only component
 * to directly consume the dataService.
 *
 */
@Injectable()
export class PadService {

    public padCollection: any[] = [];
    public selectedItemAddress: any = '';
    public pads: Pad[] = [];
    public pad: Pad = <Pad>{};
    public pages: Page[] = [];

    private _change: EventEmitter = new EventEmitter();

    constructor(private uiState: UiState, private dataService: DataService) {

        uiState.create()
            .map(val => {
                console.log('creating:', val);
                return this.dataService.createItem(val).subscribe(() =>  this.reloadContents());
            }).subscribe();

        uiState.deleteSelected()
            .map(item => {
                console.log('deleting selected item', item);
                return this.dataService.deleteItem(item).subscribe(() =>  this.reloadContents());
            }).subscribe();

        uiState.reOrder()
            .map(val => {
                let item, limit;
                if (val.type === types.PAGE) {
                    item = this.pages.filter(page => page._id === val.id)[0];
                    limit = this.pages.length;
                } else if (val.type === types.NOTE) {
                    item = this.padCollection.filter(note => note._id === val.id)[0];
                    limit = this.padCollection.filter(note => note.pageId === item.pageId).length + 1;
                } else {
                    item = this.pads.filter(pad => pad._id === val.id)[0];
                    limit = this.pads.length;
                }

                if (item) {
                    let newOrder = item.order + val.increment;
                    if (0 < newOrder && newOrder <= limit) {
                        item.order = newOrder;
                        return this.dataService.updateItem(item).subscribe(() => {
                            this.reloadContents();

                            if (0 < val.increment) {
                                this.uiState.selectNext();
                            } else {
                                this.uiState.selectPrev();
                            }
                        });
                    }
                }
            }).subscribe();
    }

    public reloadContents() {
        if (this.uiState.getUiContext() === UiContext.PadList) {
            return this.loadPadList();
        } else {
            return this.loadPadCollection(this.uiState.currentPadId);
        }
    }

    public loadPadList() {
        return this.dataService.fetchPadList()
            .subscribe(pads => {
                this.pads = pads;
                this.uiState.initUiView(this.pads);
                this._change.next(pads);
            });
    }

    public loadPadCollection(id: string) {
        return this.dataService.fetchPad(id).subscribe(pad => {
            this.padCollection = pad;
            this.pad = this.padCollection[0] || <Pad>{};
            this.pages = this.padCollection.filter(item => item && item.type === types.PAGE);
            this.uiState.initUiView(pad);
            this._change.next(pad);
        });
    }

    public updateItem(item) {
        console.log('updating: ', item);
        this.dataService.updateItem(item).subscribe(() => console.log('updated item:', item.titleProp));
    }

    public change() {
        return this._change.toRx();
    }

}
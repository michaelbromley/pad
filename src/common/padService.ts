import {Injectable, EventEmitter} from 'angular2/angular2';
import DataService from './dataService';
import {UiState, UiContext} from "./uiState";
import {Page, Pad, Note, types} from "./model";
import {IPadItem} from "./model";


/**
 * Service which keeps the state of the current pad and lists of pads. Should be the only component
 * to directly consume the dataService.
 *
 */
@Injectable()
export class PadService {

    private pads: Pad[] = [];
    private padsFiltered: Pad[] = [];
    public pad: Pad = <Pad>{};
    private padCollection: any[] = [];
    private padCollectionFiltered: any[] = [];
    private pages: Page[] = [];
    private pagesFiltered: Page[] = [];

    private filterQuery: string = '';
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

    /**
     * Getters - returns the data after applying a filter
     */
    public getPads(): Pad[] {
        return this.padsFiltered;
    }

    public getPadCollection(): any[] {
        return this.padCollectionFiltered;
    }

    public getPages(): Page[] {
        return this.pagesFiltered;
    }

    private init() {
        this.padCollection = [];
        this.pads = [];
        this.pages = [];
        this.filterQuery = '';
    }

    public setFilterQuery(val: string) {
        if (this.filterQuery === val) {
            return;
        }
        this.filterQuery = val.toLowerCase();
        if (this.uiState.getUiContext() === UiContext.PadList) {
            this.padsFiltered = this.pads.filter(pad => {
                return -1 < pad.name.toLowerCase().indexOf(this.filterQuery);
            });
            this.uiState.updateUiView(this.padsFiltered);
        } else {
            this.padCollectionFiltered = this.padCollection.filter(item => {
                if (item.type !== types.NOTE) {
                    return true;
                }
                return -1 < item.content.toLowerCase().indexOf(this.filterQuery);
            });
            this.pagesFiltered = this.createPagesArray(this.padCollectionFiltered).filter(page => {
                // include the page only if either a note it contains passes the filter, or
                // if the page itself passes the filter.
                if (-1 < page.title.toLowerCase().indexOf(this.filterQuery)) {
                    return true;
                }
                let filteredNotes = this.padCollectionFiltered.filter(item => {
                    return item.pageId && item.pageId === page._id;
                });
                return 0 < filteredNotes.length;
            })
        }
        this.uiState.deselectAll();
        this._change.next({});
    }

    /**
     * Do a full reload from the dataService
     */
    public reloadContents() {
        if (this.uiState.getUiContext() === UiContext.PadList) {
            return this.loadPadList(true);
        } else {
            return this.loadPadCollection(this.uiState.currentPadId, true);
        }
    }

    /**
     * Fetch the list of pads from the server.
     */
    public loadPadList(isUpdate: boolean = false) {
        this.init();
        return this.dataService.fetchPadList()
            .subscribe(pads => {
                this.pads = this.padsFiltered = pads;
                if (isUpdate) {
                    this.uiState.updateUiView(this.pads);
                } else {
                    this.uiState.initUiView(this.pads);
                }
                this._change.next(pads);
            });
    }

    /**
     * Fetch and load the pad collection from the server. If isUpdate = true,
     * then do no reset the address of the currently-selected item.
     */
    public loadPadCollection(id: string, isUpdate: boolean = false) {
        this.init();
        return this.dataService.fetchPad(id).subscribe(pad => {
            this.padCollection = this.padCollectionFiltered = pad;
            this.pad = this.padCollection[0] || <Pad>{};
            this.pages = this.pagesFiltered = this.createPagesArray(this.padCollection);
            if (isUpdate) {
                this.uiState.updateUiView(pad);
            } else {
                this.uiState.initUiView(pad);
            }
            this._change.next(pad);
        });
    }

    private createPagesArray(padCollection: any[]) {
        return padCollection.filter(item => item && item.type === types.PAGE);
    }

    public updateItem(item) {
        console.log('updating: ', item);
        this.dataService.updateItem(item).subscribe(() => console.log('updated item:', item.titleProp));
    }

    public change() {
        return this._change.toRx();
    }

}
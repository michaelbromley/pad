import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import DataService from '../../common/dataService';
import TitleInputCmp from '../titleInput/titleInput.cmp';
import NoteEditorCmp from '../noteEditor/noteEditor.cmp';
import {UiState} from '../../common/uiState';
import {types, IPadItem, Note, Pad, Page} from "../../common/model";

@Component({
    selector: 'pad',
    template: require('./pad.cmp.html'),
    directives: [CORE_DIRECTIVES, TitleInputCmp, NoteEditorCmp],
    providers: [DataService]
})
class PadCmp {

    public newPageTitle: string =  '';
    public padCollection: any[] = [];
    public selectedItemAddress: any = '';
    public pad: Pad = <Pad>{};
    public pages: Page[] = [];

    constructor(private dataService: DataService,
                private params: RouteParams,
                private uiState: UiState) {


        uiState.create()
            .map(val => {
                console.log('creating:', val);
                return this.dataService.createItem(val).subscribe();
            })
            .subscribe(val => {
                //console.log('created new item', val);
                this.initPadCollection();
            });

        uiState.deleteSelected()
            .map(item => {
                console.log('deleting selected item', item);
                return this.dataService.deleteItem(item).subscribe();
            })
            .subscribe(val => {
                //console.log('deleted item', val);
                this.initPadCollection();
            });

        uiState.reOrder()
            .map(val => {
                let item, limit;
                if (val.type === types.PAGE) {
                    item = this.pages.filter(page => page._id === val.id)[0];
                    limit = this.pages.length
                } else if (val.type === types.NOTE) {
                    item = this.padCollection.filter(note => note._id === val.id)[0];
                    limit = this.padCollection.filter(note => note.pageId === item.pageId).length + 1;
                }

                if (item) {
                    let newOrder = item.order + val.increment;
                    if (0 < newOrder && newOrder <= limit) {
                        item.order = newOrder;
                        return this.dataService.updateItem(item).subscribe(() => {
                            if (0 < val.increment) {
                                this.uiState.selectNext();
                            } else {
                                this.uiState.selectPrev();
                            }
                        });
                    }
                }
            })
            .subscribe(val => {
                //console.log('reordered item', val);
                this.initPadCollection();
            });

        this.initPadCollection();
    }

    private initPadCollection() {
        this.dataService.fetchPad(this.params.get('id')).subscribe(pad => {
            this.padCollection = pad;
            this.pad = this.padCollection[0] || <Pad>{};
            this.pages = this.padCollection.filter(item => item.type === types.PAGE);
            this.uiState.initPadCollection(pad);
        });
    }

    public getNotesInPage(pageId: string): Note[] {
        return this.padCollection.filter(item => item.pageId === pageId);
    }

    public updateItem(item) {
        console.log('updating: ', item);
        this.dataService.updateItem(item).subscribe(() => console.log('updated item:', item.titleProp));
    }

    public checkSelected(address) {
        return this.uiState.addressIsSelected(address);
    }
}

export default PadCmp;
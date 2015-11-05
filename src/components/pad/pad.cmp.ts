import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import {types} from '../../common/model';
import DataService from '../../common/dataService';
import PageCmp from '../page/page.cmp';
import TitleInputCmp from '../titleInput/titleInput.cmp';
import NoteEditorCmp from '../noteEditor/noteEditor.cmp';
import * as navigator from '../../common/navigator';
import {Note, Pad, Page} from "../../common/model";
const keyboardJS = require('keyboardjs');

@Component({
    selector: 'pad',
    template: require('./pad.cmp.html'),
    directives: [CORE_DIRECTIVES, TitleInputCmp, PageCmp, NoteEditorCmp],
    providers: [DataService]
})
class PadCmp {

    public newPageTitle: string =  '';
    public padCollection: any[] = [];
    public selectedItemAddress: any = '';
    public pad: Pad = <Pad>{};
    public pages: Page[] = [];
    public notes: Note[] = [];

    constructor(private dataService: DataService,
                params: RouteParams) {
        dataService.fetchPad(params.get('id')).subscribe(pad => {
            this.padCollection = pad;

            this.pad = this.padCollection[0] || <Pad>{};
            this.pages = this.padCollection.filter(item => item.type === types.PAGE);
            navigator.init(pad);
        });

        keyboardJS.bind('down', () => {
            navigator.next();
            this.selectedItemAddress = navigator.getSelectedItemAddress();
        });
        keyboardJS.bind('up', () => {
            navigator.prev();
            this.selectedItemAddress = navigator.getSelectedItemAddress();
        });
        keyboardJS.bind('enter', () => {
            navigator.down();
            this.selectedItemAddress = navigator.getSelectedItemAddress();
        });
        keyboardJS.bind('escape', () => {
            navigator.up();
            this.selectedItemAddress = navigator.getSelectedItemAddress();
        });
    }

    public getNotesInPage(pageId: string): Note[] {
        return this.padCollection.filter(item => item.pageId === pageId);
    }

    public updateItem(item) {
        this.dataService.updateItem(item).subscribe(() => console.log('updated item:', item.title));
    }

    public updatePadTitle(newName) {
        this.pad.name = newName;
        this.dataService.updateItem(this.pad).subscribe(() => console.log('updated pad title!'));
    }

    public checkSelected(address) {
        return this.selectedItemAddress.toString() === address.toString() ? 'selected' : '';
    }
}

export default PadCmp;
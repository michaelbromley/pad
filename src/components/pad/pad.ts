import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import {types} from '../../common/model';
import DataService from '../../common/dataService';
//import Page from '../page/page';
import TitleInput from '../titleInput/titleInput';
//import NoteEditor from '../noteEditor/noteEditor';
import * as navigator from '../../common/navigator';
import {Note, Pad, Page} from "../../common/model";
const keyboardJS = require('keyboardjs');

@Component({
    selector: 'pad',
    template: require('./pad.html'),
    directives: [CORE_DIRECTIVES, TitleInput],
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
            this.notes = this.padCollection.filter(item => item.type === types.NOTE);
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

    public updateItem(event) {
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
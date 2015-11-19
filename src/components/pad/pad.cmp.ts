import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import TitleInputCmp from '../titleInput/titleInput.cmp';
import NoteEditorCmp from '../noteEditor/noteEditor.cmp';
import {UiState} from '../../common/uiState';
import {types, IPadItem, Note, Pad, Page} from "../../common/model";
import {PadService} from "../../common/padService";

@Component({
    selector: 'pad',
    template: require('./pad.cmp.html'),
    directives: [CORE_DIRECTIVES, TitleInputCmp, NoteEditorCmp]
})
class PadCmp {

    public newPageTitle: string =  '';
    public padCollection: any[] = [];
    public selectedItemAddress: any = '';
    public pad: Pad = <Pad>{};
    public pages: Page[] = [];

    private subscriptions = [];

    constructor(private padService: PadService,
                private params: RouteParams,
                private uiState: UiState) {
        padService.loadPadCollection(params.get('id'));

        let sub = padService.change().subscribe(() => {
            console.log('[pad] change event');
            this.padCollection = padService.padCollection;
            this.pad = padService.pad;
            this.pages = padService.pages;
        });
        this.subscriptions.push(sub);
    }

    onDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }


    public getNotesInPage(pageId: string): Note[] {
        return this.padCollection.filter(item => item.pageId === pageId);
    }

    public updateItem(item) {
        this.padService.updateItem(item);
    }

    public checkSelected(address) {
        return this.uiState.addressIsSelected(address);
    }
}

export default PadCmp;
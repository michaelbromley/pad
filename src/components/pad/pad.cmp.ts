import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import TitleInputCmp from '../titleInput/titleInput.cmp';
import NoteEditorCmp from '../noteEditor/noteEditor.cmp';
import {UiState} from '../../common/uiState';
import {Type, Note, Pad, Page} from "../../common/model";
import {PadService} from "../../common/padService";

@Component({
    selector: 'pad',
    template: require('./pad.cmp.html'),
    directives: [CORE_DIRECTIVES, TitleInputCmp, NoteEditorCmp]
})
class PadCmp {

    public pad: Pad = <Pad>{};

    private subscriptions = [];

    constructor(private padService: PadService,
                private params: RouteParams,
                private uiState: UiState) {
    }

    onActivate() {
        this.padService.getPad(this.params.get('id'))
            .subscribe(pad => {
                this.pad = pad;
                this.uiState.initUiView(this.pad);
            });

        let sub = this.padService.change().subscribe(pad=> {
            console.log('[pad] change event');
            this.pad = pad;
            this.uiState.initUiView(this.pad);
        });
        this.subscriptions.push(sub);
    }

    onDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    public updateItem(item) {
        //this.padService.updateItem(item);
    }

    public checkSelected(address) {
        return this.uiState.addressIsSelected(address);
    }
}

export default PadCmp;
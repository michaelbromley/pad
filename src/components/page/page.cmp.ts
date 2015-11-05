import {Component, Input, Output, EventEmitter} from 'angular2/angular2';
import TitleInputCmp from '../titleInput/titleInput.cmp';
import {Page} from "../../common/model";
//import NoteEditor from '../noteEditor/noteEditor';

@Component({
    selector: 'page',
    template: require('./page.cmp.html'),
    directives: [TitleInputCmp],
})
class PageCmp {

    @Input() public page: Page;
    @Output() public update = new EventEmitter();

    constructor() {
    }

    updateTitle = (title) => {
        this.page.title = title;
        this.update.next(this.page);
    };
}

export default PageCmp;
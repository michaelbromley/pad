import DataService from '../../common/dataService';
import {Component, NgFor} from 'angular2/angular2';

@Component({
    selector: 'pad-list',
    template: `<div>
        Found {{ pads.length }} pads.
        <ul>
            <li *ng-for="#pad of pads">
                <span>this is {{ pad.name }}</span>
            </li>
        </ul>
        <input type="text"/>
        <button>New Pad</button>
    </div>`,
    directives: [NgFor],
    providers: [DataService]
})
class PadListCmp {

    public pads: any[] = [];

    constructor(private dataService: DataService) {
        this.dataService.fetchPadList()
            .subscribe(pads => {
                this.pads = pads;
                console.log('this.pads:', this.pads);
            });
    }
}

export default PadListCmp;
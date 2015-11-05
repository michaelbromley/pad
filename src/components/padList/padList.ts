import DataService from '../../common/dataService';
import {Component, NgFor} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';

@Component({
    selector: 'pad-list',
    template: require('./padList.html'),
    directives: [NgFor, RouterLink],
    providers: [DataService]
})
class PadList {

    public pads: any[] = [];

    constructor(private dataService: DataService) {
        this.dataService.fetchPadList()
            .subscribe(pads => {
                this.pads = pads;
            });
    }
}

export default PadList;
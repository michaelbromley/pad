import flux from 'control';
import {createStore, bind} from 'alt/utils/decorators';
import PadActions from 'actions/padActions';

@createStore(flux)
class PadStore {

    constructor() {
        this.pads = [];
        this.pad = {
            pages: []
        };
    }

    @bind(PadActions.fetchPadList)
    onFetchPadList() {
        console.log('fetching pads...');
    }

    @bind(PadActions.receivedPadListResults)
    onReceivedPadListResults(pads) {
        this.pads = pads;
    }

    @bind(PadActions.receivedPadResults)
    onRecievedPadResults(pad) {
        this.pad = pad;
    }

    @bind(PadActions.createPadSuccess)
    createPadSuccess(response) {
        console.log('created new pad');
        this.pads.push(response.data);
    }

    @bind(PadActions.deletePadSuccess)
    deletePadSuccess(response) {
        console.log('pad successfully deleted');
        var id = response.data,
            index = this.pads.map(pad => pad._id).indexOf(id);

        this.pads.splice(index, 1);
    }
}

export default PadStore;

import flux from 'control';
import {createStore, bind} from 'alt/utils/decorators';
import PadActions from 'actions/padActions';
import PadSource from 'sources/padSource';

@createStore(flux)
class PadStore {

    constructor() {
        this.pads = [];
        //this.registerAsync(PadSource);
    }

    /*@bind(PadActions.getAllPads)
    onGetAllPads() {
        this.getInstance().getPads()
            .then(pads => {
                console.log(pads);
                this.pads = pads
            });
    }*/

    @bind(PadActions.fetchPads)
    onFetchPads() {
        console.log('fetching pads...');
    }

    @bind(PadActions.receivedPadResults)
    onReceivedPadResults(pads) {
        this.pads = pads;
    }

    @bind(PadActions.createPad)
    onCreatePad(name) {
        console.log('creating new pad ' + name);
        var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
        this.pads.push({ id: id, name: name });
        console.log(this.pads);
    }
}

export default PadStore;

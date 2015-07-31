import flux from 'control';
import {createStore, bind} from 'alt/utils/decorators';
import PadActions from 'actions/padActions';

@createStore(flux)
class PadStore {

    constructor() {
        this.pads = [
            { id: 'id1', 'name': 'Project X'},
            { id: 'id2', 'name': 'Project Y'}
        ];
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

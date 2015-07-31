import axios from 'axios';
import config from 'util/config';
import flux from 'control';
import {createActions} from 'alt/utils/decorators';

@createActions(flux)
class PadActions {
    constructor() {
        this.generateActions(
            'createPad',
            'receivedPadResults',
            'fetchingPadResultsFailed'
        );
    }

    fetchPads() {
        this.dispatch();
        return axios.get(`${config.API_URL}/pads`)
            .then(data => this.actions.receivedPadResults(data.data));
    }
}

export default PadActions;
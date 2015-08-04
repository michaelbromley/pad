import axios from 'axios';
import config from 'util/config';
import flux from 'control';
import {createActions} from 'alt/utils/decorators';

@createActions(flux)
class PadActions {
    constructor() {
        this.generateActions(
            'createPadSuccess',
            'deletePadSuccess',
            'receivedPadListResults',
            'receivedPadResults',
            'fetchingPadResultsFailed'
        );
    }

    fetchPadList() {
        this.dispatch();
        return axios.get(`${config.API_URL}/pads`)
            .then(data => this.actions.receivedPadListResults(data.data));
    }

    fetchPad(id) {
        this.dispatch();
        return axios.get(`${config.API_URL}/pads/${id}`)
            .then(data => this.actions.receivedPadResults(data.data));
    }

    createPad(name) {
        console.log('creating pad...');
        return axios.post(`${config.API_URL}/pads`, { name: name })
            .then(data => this.actions.createPadSuccess(data));
    }

    deletePad(id) {
        return axios.delete(`${config.API_URL}/pads/${id}`)
            .then(data => this.actions.deletePadSuccess(data));
    }
}

export default PadActions;
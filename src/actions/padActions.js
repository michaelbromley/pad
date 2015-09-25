import axios from 'axios';
import config from 'util/config';
import flux from 'control';
import {createActions} from 'alt/utils/decorators';

@createActions(flux)
class PadActions {
    constructor() {
        this.generateActions(
            'createPadSuccess',
            'updatePadSuccess',
            'deletePadSuccess',
            'receivedPadListResults',
            'receivedPadResults',
            'fetchingPadResultsFailed'
        );
    }

    // Pad level
    fetchPadList() {
        this.dispatch();
        return axios.get(`${config.API_URL}/pads`)
            .then(data => this.actions.receivedPadListResults(data.data));
    }

    fetchPad(id) {
        console.log(`fetching pad id: ${id}`);
        this.dispatch();
        return axios.get(`${config.API_URL}/pads/${id}`)
            .then(data => this.actions.receivedPadResults(data.data));
    }

    createPad(name) {
        console.log('creating pad...');
        return axios.post(`${config.API_URL}/pads`, { name: name })
            .then(data => this.actions.createPadSuccess(data));
    }

    updatePad(id, name) {
        return axios.put(`${config.API_URL}/pads/${id}`, { name: name })
                    .then(data => this.actions.updatePadSuccess(data));
    }

    deletePad(id) {
        return axios.delete(`${config.API_URL}/pads/${id}`)
            .then(data => this.actions.deletePadSuccess(data));
    }

    // Page level

    createPage(padId, title) {
        console.log('creating page...');
        return axios.post(`${config.API_URL}/pads/${padId}/pages`, { title: title })
            .then(data => this.actions.fetchPad(padId));
    }

    deletePage(padId, pageId) {
        console.log('deleting page...');
        return axios.delete(`${config.API_URL}/pads/${padId}/pages/${pageId}`)
            .then(data => this.actions.fetchPad(padId));
    }

    updatePage(padId, page) {
        return axios.put(`${config.API_URL}/pads/${padId}/pages/${page._id}`, page)
            .then(data => this.actions.fetchPad(padId));
    }

    // Note level

    createNote(padId, pageId, content) {
        console.log('creating note...');
        return axios.post(`${config.API_URL}/pads/${padId}/pages/${pageId}/notes`, { content: content})
            .then(data => this.actions.fetchPad(padId));
    }
}

export default PadActions;
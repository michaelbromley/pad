import axios from 'axios';
import config from 'util/config';
import flux from 'control';
import {createActions} from 'alt/utils/decorators';

@createActions(flux)
class PageActions {
    constructor() {
        this.generateActions(
            'createPageSuccess',
            'deletePageSuccess',
            'receivedPageListResults',
            'receivedPageResults',
            'fetchingPageResultsFailed'
        );
    }

    fetchPageList(padId) {
        this.dispatch();
        return axios.get(`${config.API_URL}/pads/${padId}/pages`)
            .then(data => this.actions.receivedPageListResults(data.data));
    }

    fetchPage(pageId) {
        this.dispatch();
        return axios.get(`${config.API_URL}/pages/${pageId}`)
            .then(data => this.actions.receivedPageResults(data.data));
    }

    createPage(padId, name) {
        console.log('creating page...');
        return axios.post(`${config.API_URL}/pads/${padId}/pages`, { name: name })
            .then(data => this.actions.createPageSuccess(data));
    }

    deletePage(padId, pageId) {
        return axios.delete(`${config.API_URL}/pads/${padId}/pages/${pageId}`)
            .then(data => this.actions.deletePageSuccess(data));
    }
}

export default PageActions;
import flux from 'control';
import {createStore, bind} from 'alt/utils/decorators';
import PageActions from 'actions/pageActions';

@createStore(flux)
class PageStore {

    constructor() {
        this.pages = [];
    }


    @bind(PageActions.fetchPageList)
    onFetchPageList() {
        console.log('fetching pads...');
    }

    @bind(PageActions.receivedPageListResults)
    onReceivedPageListResults(pages) {
        this.pages = pages;
    }

    @bind(PageActions.receivedPageResults)
    onRecievedPageResults(pad) {
        this.pad = pad;
    }

    @bind(PageActions.createPageSuccess)
    createPageSuccess(response) {
        console.log('created new pad');
        this.pads.push(response.data);
    }

    @bind(PageActions.deletePageSuccess)
    deletePageSuccess(response) {
        console.log('pad successfully deleted');
        var id = response.data,
            index = this.pads.map(pad => pad._id).indexOf(id);

        this.pads.splice(index, 1);
    }
}

export default PageStore;

import PadActions from 'actions/padActions';
import config from 'util/config';

export const PadSource = {

    getPads: {

        remote(state) {
            return axios.get(config.API_URL + `/pads`);
        },

        //loading: PadActions.loadingResults, // (optional)
        success: PadActions.receivedPadResults, // (required)
        error: PadActions.fetchingPadResultsFailed, // (required)
    }

};
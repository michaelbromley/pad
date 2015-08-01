import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import PadStore from 'stores/padStore';
import PadActions from 'actions/padActions';

class Pad extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        //PadActions.fetchPads();
    }

    render() {
        return (
            <div>
               <h1>Pad</h1>
            </div>
        );
    }
}

export default Pad;
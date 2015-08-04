import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import PadStore from 'stores/padStore';
import PadActions from 'actions/padActions';

@connectToStores
class Pad extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pad: props.pad
        };

        PadStore.listen(store => {
            this.setState({ pad: store.pad });
        });
    }

    static getStores(props) {
        return [PadStore];
    }

    static getPropsFromStores(props) {
        return PadStore.getState();
    }
    componentWillMount() {
        console.log('fetching pad ' + this.props.params.id);
        PadActions.fetchPad(this.props.params.id);
    }

    render() {
        console.log(this.state.pad);
        return (
            <div>
                <h1>Pad: {this.state.pad.name}</h1>
            </div>
        );
    }
}

export default Pad;
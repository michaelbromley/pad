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
    }

    static getStores(props) {
        return [PadStore];
    }

    static getPropsFromStores(props) {
        return PadStore.getState();
    }
    componentDidMount() {
        PadActions.fetchPad(this.props.params.id);

        this.cancelListen = PadStore.listen(store => {
            this.setState({ pad: store.pad });
        });
    }

    componentWillUnmount() {
        this.cancelListen();
    }

    render() {
        return (
            <div>
                <h1>Pad: {this.state.pad.name}</h1>
            </div>
        );
    }
}

export default Pad;
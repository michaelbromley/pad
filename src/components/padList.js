import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import {Link} from 'react-router';
import PadStore from 'stores/padStore';
import PadActions from 'actions/padActions';

@connectToStores
class PadList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pads: props.pads,
        };

        PadStore.listen(store => {
            console.log('setting state');
            this.setState({ pads: store.pads });
        });
    }

    static getStores(props) {
        return [PadStore];
    }

    static getPropsFromStores(props) {
        return PadStore.getState();
    }

    componentWillMount() {
        PadActions.fetchPads();
    }

    createPad = () => {
        PadActions.createPad(this.refs.newPadName.getDOMNode().value);
    };

    render() {
        return (
            <div>
                <ul>
                {this.state.pads.map(pad => {
                    console.log(pad);
                    return (
                        <li><Link to="pad" params={{ id: pad._id }}>{pad.name}</Link></li>
                    );
                })}
                </ul>
                <input type="text" ref="newPadName" />
                <button onClick={this.createPad}>New Pad</button>
            </div>
        );
    }
}

export default PadList;
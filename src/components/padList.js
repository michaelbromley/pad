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
            pads: props.pads
        };
    }

    static getStores(props) {
        return [PadStore];
    }

    static getPropsFromStores(props) {
        return PadStore.getState();
    }

    componentWillMount() {
        PadActions.fetchPadList();
        PadStore.listen(store => {
            this.setState({ pads: store.pads });
        });
    }

    createPad = () => {
        PadActions.createPad(this.refs.newPadName.getDOMNode().value);
    };

    deletePad = (id) => {
        PadActions.deletePad(id);
    };

    render() {
        return (
            <div>
                <ul>
                {this.state.pads.map(pad => {
                    return (
                        <li key={pad._id}>
                            <Link to="pad" params={{ id: pad._id }}>{pad.name}</Link>
                            <button onClick={this.deletePad.bind(this, pad._id)}>x</button>
                        </li>
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
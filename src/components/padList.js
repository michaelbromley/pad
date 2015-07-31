import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import {RouteHandler, Link} from 'react-router';
import PadStore from 'stores/padStore';
import PadActions from 'actions/padActions';

@connectToStores
class PadList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pads: props.pads,
        }
    }

    static getStores(props) {
        return [PadStore];
    }

    static getPropsFromStores(props) {
        return PadStore.getState();
    }

    createPad = () => {
        console.log(this.refs);
        PadActions.createPad(this.refs.newPadName.getDOMNode().value);
    };

    render() {
        return (
            <div>
                {this.state.pads.forEach(pad => {
                    return (
                        <div className="pad">{pad.name}</div>
                    );
                })}
                <input type="text" ref="newPadName" />
                <button onClick={this.createPad}>New Pad</button>
            </div>
        );
    }
}

export default PadList;
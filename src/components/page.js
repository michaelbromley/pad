import React from 'react';
import PadActions from 'actions/pageActions';

class Page extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="page-container">
                <button style="float: right" onClick={this.props.onDelete.bind(this, this.props.page._id)}>x</button>
                <h2>{this.props.page.title}</h2>

            </div>
        );
    }
}

export default Page;
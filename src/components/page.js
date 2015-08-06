import React from 'react';
import PageActions from 'actions/pageActions';

class Page extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="page-container">
                <h2>{this.props.page.name}</h2>
            </div>
        );
    }
}

export default Pad;
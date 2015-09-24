import React from 'react';
import PadActions from 'actions/pageActions';
import TitleInput from 'components/titleInput/titleInput';

class Page extends React.Component {

    constructor(props) {
        super(props);
    }

    onUpdateTitle = (event) => {
        var page = this.props.page;
        page.title = event.target.value;
        this.props.onUpdate(page);
    };

    render() {
        return (
            <div className="page-container">
                <button style={{'float': 'right'}} onClick={this.props.onDelete.bind(this, this.props.page._id)}>x</button>
                <TitleInput title={this.props.page.title} onChange={this.onUpdateTitle} element="h3" />

            </div>
        );
    }
}

export default Page;
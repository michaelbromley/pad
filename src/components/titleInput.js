import React from 'react';

class TitleInput extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div className="titleInput">
                <h2>{this.props.title}</h2>
                <div className="input">
                    <input value={this.props.title} />
                </div>
            </div>
        );
    }
}

export default TitleInput;
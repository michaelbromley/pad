import React from 'react';

class TitleInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            focus: false
        };
    }

    focus = () => {
        this.setState({
            focus: true
        });
        setTimeout(() => React.findDOMNode(this.refs.input).focus(), 0);
    };

    blur = () => {
        this.setState({
            focus: false
        });
    };

    render() {
        var outerClass = 'title-input ' + (this.state.focus ? 'focus' : ''),
            inputClass = 'input ' + this.props.element;
        return (
            <div className={outerClass} tabIndex="0" onClick={this.focus} onFocus={this.focus}>
                <this.props.element>{this.props.title}</this.props.element>
                <div className={inputClass}>
                    <input  ref="input" value={this.props.title}
                            onChange={this.props.onChange.bind(this)}
                            onBlur={this.blur} />
                </div>
            </div>
        );
    }
}

export default TitleInput;
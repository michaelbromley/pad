import React from 'react';
import markdown from 'markdown';

class NoteEditor extends React.Component {
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
    };

    change = (event) => {
        let note = this.props.note;
        note.content = event.target.value;
        this.props.onChange(note);
    };

    blur = (event) => {
        this.setState({
            focus: false
        });
        this.props.onBlur(this.props.note);
    };

    parseMarkdown(md) {
        return {
            __html: markdown.parse(md || '')
        };
    }

    render() {
        var outerClass = 'title-input ' + (this.state.focus ? 'focus' : ''),
            inputClass = 'input ' + this.props.element,
            previewHtml = this.parseMarkdown(this.props.note.content);
        return (
            <div className={outerClass} tabIndex="0" onClick={this.focus} onFocus={this.focus}>
                <textarea value={this.props.note.content}
                          ref="input"
                          onChange={this.change}
                          onBlur={this.blur}></textarea>
                <div className="preview" dangerouslySetInnerHTML={previewHtml}></div>
            </div>
        );
    }
}

export default NoteEditor;
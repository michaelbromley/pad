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

    keyHandler = (event) => {
        let keyCode = event.keyCode || event.which,
            textarea = event.target;

        if (keyCode == 9) {
            event.preventDefault();
            let start = textarea.selectionStart,
                end = textarea.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);

            // put caret at right position again
            textarea.selectionStart = textarea.selectionEnd = start + 1;
        }
    };

    render() {
        var outerClass = 'title-input ' + (this.state.focus ? 'focus' : ''),
            inputClass = 'input ' + this.props.element,
            previewHtml = this.parseMarkdown(this.props.note.content);
        return (
            <div className={outerClass} tabIndex="0" onClick={this.focus} onFocus={this.focus}>
                <textarea value={this.props.note.content}
                          ref="input"
                          onChange={this.change}
                          onBlur={this.blur}
                          onKeyDown={this.keyHandler}></textarea>
                <div className="preview" dangerouslySetInnerHTML={previewHtml}></div>
            </div>
        );
    }
}

export default NoteEditor;
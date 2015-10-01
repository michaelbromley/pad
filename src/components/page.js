import React from 'react';
import PadActions from 'actions/pageActions';
import TitleInput from 'components/titleInput/titleInput';
import NoteEditor from 'components/note/noteEditor';

class Page extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    onUpdateTitle = (title) => {
        let page = this.props.page;
        page.title = title;
        this.props.onUpdate(page);
    };

    onSetTitle = (title) => {
        let page = this.props.page;
        page.title = title;
        this.props.onChange(page);
    };

    createNote = () => {
        this.props.onCreateNote(this.props.page._id, this.refs.newNoteContent.getDOMNode().value);
    };

    onUpdateNote = (note) => {
        let page = this.props.page,
            index = page.notes.map(note => note._id).indexOf(note._id);
        page.notes[index] = note;
        this.props.onUpdate(page);
    };

    onSetNote = (note) => {
        let page = this.props.page,
            index = page.notes.map(note => note._id).indexOf(note._id);
        page.notes[index] = note;
        this.props.onChange(page);
    };

    render() {

        let notes = this.props.page.notes.map(note => {
            return <li key={note._id}><NoteEditor note={note}
                                   onBlur={this.onUpdateNote}
                                   onChange={this.onSetNote} ></NoteEditor></li>;
        });
        return (
            <div className="page-container">
                <button className="remove-button" onClick={this.props.onDelete.bind(this, this.props.page._id)}>x</button>
                <TitleInput title={this.props.page.title} onBlur={this.onUpdateTitle} onChange={this.onSetTitle} element="h3" />
                <ul className="notes-list">
                    {notes}
                    <li>
                        <textarea ref="newNoteContent"></textarea>
                        <button onClick={this.createNote}>add note</button>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Page;
import React from 'react';
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

    createNote = (note) => {
        this.props.onCreateNote(this.props.page._id, note.title);
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
                <div className="remove-button" onClick={this.props.onDelete.bind(this, this.props.page._id)}>x</div>
                <TitleInput title={this.props.page.title} onBlur={this.onUpdateTitle} onChange={this.onSetTitle} element="h3" />
                <ul className="notes-list">
                    {notes}
                    <li>
                        <NoteEditor note={{}}
                                    onBlur={this.createNote}
                                    onChange={this.onSetNote}></NoteEditor>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Page;
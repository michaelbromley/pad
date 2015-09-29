import React from 'react';
import PadActions from 'actions/pageActions';
import TitleInput from 'components/titleInput/titleInput';

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

    createNote = () => {
        this.props.onCreateNote(this.props.page._id, this.refs.newNoteContent.getDOMNode().value);
    };

    render() {

        let notes = this.props.page.notes.map(note => {
            return <li>{note.content}</li>;
        });
        return (
            <div className="page-container">
                <button className="remove-button" onClick={this.props.onDelete.bind(this, this.props.page._id)}>x</button>
                <TitleInput title={this.props.page.title} onChange={this.onUpdateTitle} element="h3" />
                <ul>
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
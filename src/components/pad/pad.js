import React from 'react';
import {types} from 'common/model';
import * as data from 'common/dataService';
import Page from 'components/page/page';
import TitleInput from 'components/titleInput/titleInput';
import NoteEditor from 'components/noteEditor/noteEditor';


class Pad extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newPageTitle: '',
            padCollection: [],
            selectedItem: '',
            selectedItemActive: false
        };
    }

    componentDidMount() {
        data.fetchPad(this.props.params.id).then(pad => {
            console.log('pad fetched:', pad);
            this.setState({ padCollection: pad });
        });
    }

    setPadTitle = (title) => {
        var pad = this.state.pad;
        pad.name = title;
        this.setState({
            pad: pad
        });
    };

    updatePadTitle = () => {
        //PadActions.updatePad(this.state.pad._id, this.state.pad.name);
    };

    updateNewPageTitle = (event) => {
        this.setState({ newPageTitle: event.target.value });
    };

    createPage = () => {
        var padId = this.state.pad._id,
            pageTitle = this.state.newPageTitle;
        //PadActions.createPage(padId, pageTitle);
        this.setState({ newPageTitle: '' });
    };

    setPage = (page) => {
        var pad = this.state.pad;
        var index = pad.pages.map(page => page._id).indexOf(page._id);
        pad.pages[index] = page;

        this.setState({
            pad: pad
        });
    };

    updatePage = (page) => {
        //PadActions.updatePage(this.state.pad._id, page);
    };

    deletePage = (pageId) => {
        //PadActions.deletePage(this.state.pad._id, pageId);
    };

    createNote = (pageId, content) => {
        //PadActions.createNote(this.state.pad._id, pageId, content);
    };

    renderNote(note) {
        return (
            <li key={note._id}>
                <NoteEditor note={note}
                            onBlur={this.onUpdateNote}
                            onChange={this.onSetNote} ></NoteEditor>
            </li>
        );
    }

    render() {
        let pad = this.state.padCollection[0] || {},
            pages = this.state.padCollection.filter(item => item.type === types.PAGE),
            notes = this.state.padCollection.filter(item => item.type === types.NOTE);
        return (
            <div className="pad-collection-list">
                <TitleInput title={pad.name} onChange={this.setPadTitle} onBlur={this.updatePadTitle} element="h2" />
                <ul>
                    {pages.map(page => {
                            return (
                                <li key={page._id}>
                                    <Page page={page}
                                          onDelete={this.deletePage}
                                          onChange={this.setPage}
                                          onUpdate={this.updatePage}
                                          onCreateNote={this.createNote}>
                                        <ul className="notes-list">
                                            {
                                                notes.filter(note => note.pageId === page._id).map(note => {
                                                   return this.renderNote(note);
                                                })
                                            }
                                        </ul>
                                    </Page>
                                </li>
                            );
                    })
                    }
                </ul>
                <input value={this.state.newPageTitle} onChange={this.updateNewPageTitle} />
                <button onClick={this.createPage}>New Page</button>
            </div>
        );
    }
}

export default Pad;
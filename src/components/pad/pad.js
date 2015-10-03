import React from 'react';
import * as model from 'models/model';
import * as data from 'services/dataService';
import Page from 'components/page/page.js';
import TitleInput from 'components/titleInput/titleInput.js';


class Pad extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newPageTitle: '',
            padCollection: []
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

    render() {
        let pad = this.state.padCollection[0] || {};
        let pages = this.state.padCollection.filter(item => item.type === model.type.PAGE);
        return (
            <div>
                <TitleInput title={pad.name} onChange={this.setPadTitle} onBlur={this.updatePadTitle} element="h2" />
                <ul>
                    {pages.map(page => {
                        return (
                            <Page page={page} key={page._id}
                                  onDelete={this.deletePage}
                                  onChange={this.setPage}
                                  onUpdate={this.updatePage}
                                  onCreateNote={this.createNote}></Page>
                        );
                    })}
                </ul>
                <input value={this.state.newPageTitle} onChange={this.updateNewPageTitle} />
                <button onClick={this.createPage}>New Page</button>
            </div>
        );
    }
}

export default Pad;
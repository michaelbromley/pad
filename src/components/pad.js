import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import PadStore from 'stores/padStore';
import PadActions from 'actions/padActions';
import Page from 'components/page.js';
import TitleInput from 'components/titleInput/titleInput.js';

@connectToStores
class Pad extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newPageTitle: '',
            pad: props.pad
        };
    }

    static getStores(props) {
        return [PadStore];
    }

    static getPropsFromStores(props) {
        return PadStore.getState();
    }
    componentDidMount() {
        PadActions.fetchPad(this.props.params.id);

        this.cancelListen = PadStore.listen(store => {
            this.setState({ pad: store.pad });
        });
    }

    componentWillUnmount() {
        this.cancelListen();
    }

    setPadTitle = (title) => {
        var pad = this.state.pad;
        pad.name = title;
        this.setState({
            pad: pad
        });
    };

    updatePadTitle = () => {
        PadActions.updatePad(this.state.pad._id, this.state.pad.name);
    };

    updateNewPageTitle = (event) => {
        this.setState({ newPageTitle: event.target.value });
    };

    createPage = () => {
        var padId = this.state.pad._id,
            pageTitle = this.state.newPageTitle;
        PadActions.createPage(padId, pageTitle);
        this.setState({ newPageTitle: '' });
    };

    updatePage = (page) => {
        PadActions.updatePage(this.state.pad._id, page);
    };

    deletePage = (pageId) => {
        PadActions.deletePage(this.state.pad._id, pageId);
    };

    createNote = (pageId, content) => {
        PadActions.createNote(this.state.pad._id, pageId, content);
    };

    render() {
        return (
            <div>
                <TitleInput title={this.state.pad.name} onChange={this.setPadTitle} onBlur={this.updatePadTitle} element="h2" />
                <ul>
                    {this.state.pad.pages.map(page => {
                        return (
                            <Page page={page} key={page._id}
                                  onDelete={this.deletePage}
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
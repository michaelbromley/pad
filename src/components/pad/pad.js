import React from 'react';
import keyboardJS from 'keyboardjs';
import {types} from 'common/model';
import * as data from 'common/dataService';
import Page from 'components/page/page';
import TitleInput from 'components/titleInput/titleInput';
import NoteEditor from 'components/noteEditor/noteEditor';
import * as navigator from 'common/navigator';


class Pad extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newPageTitle: '',
            padCollection: [],
            selectedItemAddress: ''
        };
    }

    componentDidMount() {
        data.fetchPad(this.props.params.id).then(pad => {
            console.log('pad fetched:', pad);
            this.setState({ padCollection: pad });
            navigator.init(pad);
        });

        keyboardJS.bind('down', () => {
            navigator.next();
            this.setState({
                selectedItemAddress: navigator.getSelectedItemAddress()
            });
        });
        keyboardJS.bind('up', () => {
            navigator.prev();
            this.setState({
                selectedItemAddress: navigator.getSelectedItemAddress()
            });
        });
        keyboardJS.bind('enter', () => {
            navigator.down();
            this.setState({
                selectedItemAddress: navigator.getSelectedItemAddress()
            });
        });
        keyboardJS.bind('escape', () => {
            navigator.up();
            this.setState({
                selectedItemAddress: navigator.getSelectedItemAddress()
            });
        });
    }

    createItem = (item) => {

    };

    changeItem = (item) => {

    };

    updateItem = (item) => {

    };

    deleteItem = (item) => {

    };

    renderNote(note, address) {
        return (
            <li key={note._id} className={this.checkSelected(address)}>
                <NoteEditor note={note}
                            onBlur={this.updateItem}
                            onChange={this.changeItem} ></NoteEditor>
            </li>
        );
    }

    checkSelected = (address) => {
        return this.state.selectedItemAddress.toString() === address.toString() ? 'selected' : '';
    };

    render() {
        let pad = this.state.padCollection[0] || {},
            pages = this.state.padCollection.filter(item => item.type === types.PAGE),
            notes = this.state.padCollection.filter(item => item.type === types.NOTE);

        console.log('selectedItemAddress:', navigator.getSelectedItemAddress());
        return (
            <div className="pad-collection-list">
                <ul>
                    <li className={this.checkSelected([0])}>
                        <TitleInput title={pad.name} onChange={this.changeItem} onBlur={this.updateItem} element="h2" />
                    </li>
                    {pages.map((page, index0) => {

                        return (
                            <li key={page._id} className={this.checkSelected([index0 + 1])}>
                                <ul className="notes-list">
                                    <li className={this.checkSelected([index0 + 1, 0])}>
                                        <Page page={page}
                                              onDelete={this.deleteItem}
                                              onChange={this.changeItem}
                                              onUpdate={this.updateItem}
                                              onCreateNote={this.createItem}></Page>
                                    </li>
                                    {
                                        notes.filter(note => note.pageId === page._id).map((note, index1) => {
                                            return this.renderNote(note, [index0 + 1, index1 + 1]);
                                        })
                                    }
                                </ul>
                            </li>
                        );
                    })
                    }
                </ul>
                <input value={this.state.newPageTitle} onChange={this.createItem} />
                <button onClick={this.createItem}>New Page</button>
            </div>
        );
    }
}

export default Pad;
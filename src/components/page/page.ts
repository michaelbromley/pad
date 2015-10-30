import {Component} from 'angular2/angular2';
import TitleInput from '../titleInput/titleInput';
import NoteEditor from '../noteEditor/noteEditor';

@Component({
    template: require('./page.html')
})
class Page {

    constructor(props) {
    }

    onUpdateTitle = (title) => {
       /* let page = this.props.page;
        page.title = title;
        this.props.onUpdate(page);*/
    };

    onSetTitle = (title) => {
       /* let page = this.props.page;
        page.title = title;
        this.props.onChange(page);*/
    };

    createNote = (note) => {
        //this.props.onCreateNote(this.props.page._id, note.title);
    };

    onUpdateNote = (note) => {
       /* let page = this.props.page,
            index = page.notes.map(note => note._id).indexOf(note._id);
        page.notes[index] = note;
        this.props.onUpdate(page);*/
    };

    onSetNote = (note) => {
      /*  let page = this.props.page,
            index = page.notes.map(note => note._id).indexOf(note._id);
        page.notes[index] = note;
        this.props.onChange(page);*/
    };
}

export default Page;
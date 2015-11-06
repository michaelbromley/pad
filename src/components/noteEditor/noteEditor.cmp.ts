import {Component, FORM_DIRECTIVES, CORE_DIRECTIVES, Input, Output, EventEmitter, ElementRef} from 'angular2/angular2';
import {Note} from "../../common/model";
import MarkdownPipe from "./markdownPipe";
import UiState from "../../common/uiState";

@Component({
    selector: 'note-editor',
    template: require('./noteEditor.cmp.html'),
    directives: [FORM_DIRECTIVES, CORE_DIRECTIVES],
    pipes: [MarkdownPipe]
})
class NoteEditorCmp {

    @Input() public note: Note;
    @Input() public address: number[];
    @Output() public blur = new EventEmitter();
    private focussed: boolean = false;
    private originalContent: string;

    constructor(private uiState: UiState, private elRef: ElementRef) {
        uiState.focus().subscribe(val => {
            if (val === this.address.toString()) {
                this.focus();
            } else {
                this.blurHandler();
            }
        });
        uiState.blur().subscribe(val => {
            if (val === this.address.toString()) {
                this.blurHandler();
            }
        });
    }

    private onChanges() {
        this.originalContent = this.note.content;
    }

    private focus() {
        let textarea = this.elRef.nativeElement.querySelector('textarea');
        this.focussed = true;
        this.autoSize(textarea);
        setTimeout(() => textarea.focus());
    }

    public blurHandler() {
        this.focussed = false;
        if (this.originalContent !== this.note.content) {
            this.blur.next(this.note);
            this.originalContent = this.note.content;
        }
    }

    public clickHandler() {
        this.uiState.setFocus(this.address);
    }

    public keyHandler(event) {
        let keyCode = event.keyCode || event.which,
            textarea = event.target;

        if (keyCode == 9) {
            event.preventDefault();
            this.insertTab(textarea)
        }
        this.autoSize(textarea);
    }

    /**
     * Insert a tag character to the textarea at the current caret position.
     */
    private insertTab(textarea: HTMLTextAreaElement) {
        let start = textarea.selectionStart,
            end = textarea.selectionEnd;
        // set textarea value to: text before caret + tab + text after caret
        textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
        // put caret at right position again
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    }

    private autoSize(textarea: HTMLTextAreaElement) {
        setTimeout(() => {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        });
    }
}

export default NoteEditorCmp;
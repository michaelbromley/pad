import {Component, FORM_DIRECTIVES, CORE_DIRECTIVES, Input, Output, EventEmitter, ElementRef} from 'angular2/angular2';
import {Note, IUpdateObject} from "../../common/model";
import MarkdownPipe from "./markdownPipe";
import {UiState} from "../../common/uiState";
import {clone} from "../../common/utils";

@Component({
    selector: 'note-editor',
    template: require('./noteEditor.cmp.html'),
    directives: [FORM_DIRECTIVES, CORE_DIRECTIVES],
    pipes: [MarkdownPipe]
})
class NoteEditorCmp {

    @Input() public note: Note;
    @Input() public locked: boolean;
    @Output() public blur: EventEmitter<IUpdateObject> = new EventEmitter();
    private focussed: boolean = false;
    private content: string;
    private subscriptions = [];

    constructor(private uiState: UiState, private elRef: ElementRef) {
    }

    private onInit() {
        let focusSub = this.uiState.focusEvent.subscribe(val => {
            if (val === this.note.uuid) {
                this.focus();
            } else {
                this.blurHandler();
            }
        });
        let blurSub = this.uiState.blurEvent.subscribe(val => {
            if (val === this.note.uuid) {
                this.blurHandler();
            }
        });

        this.subscriptions = [focusSub, blurSub];
    }

    private onDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }
 
    private onChanges() {
        this.content = clone(this.note.content);
    }

    private focus() {
        let textarea = this.elRef.nativeElement.querySelector('textarea');
        this.focussed = true;
        this.autoSize(textarea);
        setTimeout(() => textarea.focus());
    }

    public blurHandler() {
        if (this.focussed) {
            this.focussed = false;
            if (this.content !== this.note.content) {
                this.blur.next({
                    item: this.note,
                    oldVal: this.note.content,
                    newVal: this.content
                });
            }
            this.uiState.blurItem(this.note.uuid);
        }
    }

    public clickHandler(event: MouseEvent) {
        event.stopPropagation();
        this.uiState.focusItem(this.note.uuid);
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
        let oldHeight = textarea.scrollHeight + 'px';
        textarea.parentElement.style.height = oldHeight;
        setTimeout(() => {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
            textarea.parentElement.style.height = 'auto';
        });
    }
}

export default NoteEditorCmp;
import {Component, CORE_DIRECTIVES, FORM_DIRECTIVES, Input, Output, EventEmitter, ElementRef} from 'angular2/angular2';
import UiState from '../../common/uiState';

@Component({
    selector: 'title-input',
    template: require('./titleInput.cmp.html'),
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
})
class TitleInputCmp {

    public focussed: boolean = false;
    private originalTitle: string;
    @Input() public title: string;
    @Input() public element: string;
    @Input() public address: number[];

    @Output() private blur = new EventEmitter();

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
        this.originalTitle = this.title;
    }

    public clickHandler() {
        this.uiState.setFocus(this.address);
    }

    private focus() {
        this.focussed = true;
        setTimeout(() => {
            this.elRef.nativeElement.querySelector('input').focus();
        });
    }

    private blurHandler() {
        this.focussed = false;
        if (this.originalTitle !== this.title) {
            this.blur.next(this.title);
            this.originalTitle = this.title;
        }
    };
}

export default TitleInputCmp;
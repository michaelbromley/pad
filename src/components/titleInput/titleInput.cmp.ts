import {Component, CORE_DIRECTIVES, FORM_DIRECTIVES, Input, Output, EventEmitter, ElementRef} from 'angular2/angular2';
import {UiState} from '../../common/uiState';

@Component({
    selector: 'title-input',
    template: require('./titleInput.cmp.html'),
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
})
class TitleInputCmp {

    public focussed: boolean = false;
    private title: string;
    private subscriptions = [];
    @Input() public item: any;
    @Input() public titleProp: string;
    @Input() public element: string;
    @Input() public address: number[];

    @Output() private blur = new EventEmitter();

    constructor(private uiState: UiState, private elRef: ElementRef) {
        let focusSub = uiState.focusEvent.subscribe(val => {
            if (val === this.address.toString()) {
                this.focus();
            } else {
                this.blurHandler();
            }
        });
        let blurSub = uiState.blurEvent.subscribe(val => {
            if (val === this.address.toString()) {
                this.blurHandler();
            }
        });

        this.subscriptions.concat(focusSub, blurSub);
    }

    onDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }


    private onChanges() {
        this.title = this.item[this.titleProp];
    }

    public clickHandler(event: MouseEvent){
        event.stopPropagation();
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
        if (this.title !== this.item[this.titleProp]) {
            this.item[this.titleProp] = this.title;
            this.blur.next(this.item); // TODO: delete?
        }
    };
}

export default TitleInputCmp;
import {Component, Input, Output, EventEmitter, ElementRef} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {UiState} from '../../common/uiState';
import {IUpdateObject} from "../../common/model";

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
    @Input() public locked: boolean;
    @Input() public titleProp: string;
    @Input() public element: string;

    @Output() private blur: EventEmitter<IUpdateObject> = new EventEmitter();

    constructor(private uiState: UiState,
                private elRef: ElementRef) {
        let focusSub = uiState.focusEvent.subscribe(val => {
            if (val === this.item.uuid) {
                this.focus();
            } else {
                this.blurHandler();
            }
        });
        let blurSub = uiState.blurEvent.subscribe(val => {
            if (val === this.item.uuid) {
                this.blurHandler();
            }
        });

        this.subscriptions = [focusSub, blurSub];
    }

    ngOnDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }


    private ngOnChanges() {
        this.title = this.item[this.titleProp];
    }

    public clickHandler(event: MouseEvent){
        event.stopPropagation();
        if (!this.locked) {
            this.uiState.focusItem(this.item.uuid);
        }
    }

    private focus() {
        if (this.locked) {
            return;
        }
        this.focussed = true;
        setTimeout(() => {
            this.elRef.nativeElement.querySelector('input').focus();
        });
    }

    private blurHandler() {
        if (this.focussed) {
            this.focussed = false;
            if (this.title !== this.item[this.titleProp]) {
                this.blur.emit({
                    item: this.item,
                    oldVal: this.item[this.titleProp],
                    newVal: this.title
                });
            }
            this.uiState.blurItem(this.item.uuid);
        }
    };
}

export default TitleInputCmp;
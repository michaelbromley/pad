import {Component, CORE_DIRECTIVES, FORM_DIRECTIVES, Input, Output, EventEmitter} from 'angular2/angular2';

@Component({
    selector: 'title-input',
    template: `
     <div class="title-input" [ng-class]="{ focus: focussed }" tabIndex="0" (click)="focus()" (focus)="focus()">
        <h1 class="label">{{ title }}</h1>
        <div class="input {{ element }}">
            <input [(ng-model)]="title" (blur)="blurHandler()" />
        </div>
     </div>`,
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
})
class TitleInput {

    public focussed: boolean = false;
    @Input() public title: string;
    @Input() public element: string;

    @Output() private blur = new EventEmitter();

    constructor() {
    }

    focus = () => {
        this.focussed = true;
    };

    blurHandler = (event) => {
        this.focussed = false;
        this.blur.next(this.title);
    };
}

export default TitleInput;
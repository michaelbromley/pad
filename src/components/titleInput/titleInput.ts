import {Component, CORE_DIRECTIVES} from 'angular2/angular2';

@Component({
    selector: 'title-input',
    template: `
     <div class="title-input" [ng-class]="{ focus: focussed }" tabIndex="0" (click)="focus()" (focus)="focus()">
        <h1 class="label">{{ title }}</h1>
        <div class="input {{ element }}">
            <input #input [value]="title"
                   (change)="change()"
                   (blur)="blur()" />
        </div>
     </div>`,
    directives: [CORE_DIRECTIVES],
    inputs: ['title', 'element']
})
class TitleInput {

    public focussed: boolean = false;
    public title: string;
    public element: string;

    constructor() {
    }

    focus = () => {
        this.focussed = true;
    };

    change = (event) => {
        //this.props.onChange(event.target.value);
    };

    blur = (event) => {
        this.focussed = false;
        //this.props.onBlur(event.target.value);
    };
}

export default TitleInput;
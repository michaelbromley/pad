import {Component, CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';

@Component({
    selector: 'settings-panel',
    template: require('./settingsPanel.cmp.html'),
    directives: [CORE_DIRECTIVES]
})
class SettingsPanelCmp {

    constructor() {

    }
}

export default SettingsPanelCmp;
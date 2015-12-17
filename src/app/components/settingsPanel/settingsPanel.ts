import {Component} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';

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
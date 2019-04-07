import { Component, Input, ViewContainerRef } from "@angular/core";
import { FormGroup } from "@angular/forms";

const resources = {};

@Component({
    selector: 'nodeflow-toolbar-tabs-container',
    templateUrl: './toolbar-tabs-container.html',
    styleUrls: ['./toolbar-tabs-container.scss']
})
export class ToolbarTabsContainerComponent {

    @Input() nodeflow: ViewContainerRef; // loose coupling for nodeflow studio backing component
    @Input() toolbarForm: FormGroup; // top level form container that wraps all toolbar action items

    constructor() {

    }


}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { ToolbarAddSocketConnectorRelationComponent } from "./toolbar-add-socket-connector-relation.component";
import { ToolbarAddSocketConnectorRelationAgentService } from "./toolbar-add-socket-connector-relation-agent.service";
import { NodeModelMessageSocketCompatiblePipe } from "./node-model-message-socket-compatible.pipe";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],

    providers: [
        ToolbarAddSocketConnectorRelationAgentService
    ],

    declarations: [
        ToolbarAddSocketConnectorRelationComponent,
        NodeModelMessageSocketCompatiblePipe
    ],

    exports: [
        ToolbarAddSocketConnectorRelationComponent
    ]
})
export class ToolbarAddSocketConnectorRelationModule {
}

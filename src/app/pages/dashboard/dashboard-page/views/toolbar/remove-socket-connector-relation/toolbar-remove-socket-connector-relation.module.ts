import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { ToolbarRemoveSocketConnectorRelationComponent } from "./toolbar-remove-socket-connector-relation.component";
import { ToolbarRemoveSocketConnectorRelationAgentService } from "./toolbar-remove-socket-connector-relation-agent.service";
import { SocketConnectorRelationModelStateFilterPipe } from "./socket-connector-relation-model-state-filter.pipe";
import { ComposeNodeToSocketConnectorRelationPipe } from "./compose-node-to-socket-connector-relation.pipe";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],

    providers: [
        ToolbarRemoveSocketConnectorRelationAgentService
    ],

    declarations: [
        ToolbarRemoveSocketConnectorRelationComponent,
        ComposeNodeToSocketConnectorRelationPipe,
        SocketConnectorRelationModelStateFilterPipe
    ],

    exports: [
        ToolbarRemoveSocketConnectorRelationComponent
    ]
})
export class ToolbarRemoveSocketConnectorRelationModule {
}

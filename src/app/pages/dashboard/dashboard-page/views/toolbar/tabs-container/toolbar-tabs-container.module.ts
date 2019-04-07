import { NgModule } from '@angular/core';
import { ToolbarAddNodeflowModule } from "../add-nodeflow/toolbar-add-nodeflow.module";
import { ToolbarRemoveNodeflowModule } from "../remove-nodeflow/toolbar-remove-nodeflow.module";
import { ToolbarAddSocketConnectorRelationModule } from "../add-socket-connector-relation/toolbar-add-socket-connector-relation.module";
import { ToolbarRemoveSocketConnectorRelationModule } from "../remove-socket-connector-relation/toolbar-remove-socket-connector-relation.module";
import { ToolbarSerializeModelModule } from "../serialize-model/toolbar-serialize-model.module";
import { ToolbarTabsContainerComponent } from "./toolbar-tabs-container.component";

@NgModule({

    imports: [
        ToolbarAddNodeflowModule,
        ToolbarRemoveNodeflowModule,
        ToolbarAddSocketConnectorRelationModule,
        ToolbarRemoveSocketConnectorRelationModule,
        ToolbarSerializeModelModule
    ],

    declarations: [
        ToolbarTabsContainerComponent
    ],

    exports: [
        ToolbarTabsContainerComponent
    ]


})
export class ToolbarTabsContainerModule {
}


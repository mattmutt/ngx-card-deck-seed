import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { ToolbarRemoveNodeflowComponent } from "./toolbar-remove-nodeflow.component";
import { ToolbarRemoveNodeflowAgentService } from "./toolbar-remove-nodeflow-agent.service";

@NgModule({

    imports: [
        CommonModule,
        ReactiveFormsModule
    ],

    providers: [
        ToolbarRemoveNodeflowAgentService
    ],

    declarations: [
        ToolbarRemoveNodeflowComponent
    ],


    exports: [
        ToolbarRemoveNodeflowComponent
    ]


})
export class ToolbarRemoveNodeflowModule {
}


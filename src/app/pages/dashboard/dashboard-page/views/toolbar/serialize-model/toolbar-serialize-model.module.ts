import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { ToolbarSerializeModelAgentService } from "./toolbar-serialize-model-agent.service";
import { ToolbarSerializeModelComponent } from "./toolbar-serialize-model.component";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],

    providers: [
        ToolbarSerializeModelAgentService
    ],

    declarations: [
        ToolbarSerializeModelComponent,
    ],

    exports: [
        ToolbarSerializeModelComponent
    ]
})
export class ToolbarSerializeModelModule {
}

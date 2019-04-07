import { NgModule } from '@angular/core';
import { ToolbarTabsContainerModule } from "./tabs-container/toolbar-tabs-container.module";

@NgModule({

    imports: [
        ToolbarTabsContainerModule
    ],

    exports: [
        ToolbarTabsContainerModule
    ]


})
export class ToolbarNodeflowActionModule {
}


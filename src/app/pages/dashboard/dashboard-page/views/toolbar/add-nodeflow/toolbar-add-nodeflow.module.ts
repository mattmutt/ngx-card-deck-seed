import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { ToolbarAddNodeflowComponent } from "./toolbar-add-nodeflow.component";
import { ToolbarAddNodeflowAgentService } from "./toolbar-add-nodeflow-agent.service";
import { FindNodeflowCardProjectPackagePipe } from "./pipes/find-nodeflow-card-project-package.pipe";
import { FindCardCatalogResourcesPackagePipe } from "./pipes/find-card-catalog-resources-package.pipe";
import { LimitMessageBySocketPipe } from "./pipes/limit-message-by-socket.pipe";
import { AssetTypeOrderByPipe } from "./pipes/asset-type-order-by.pipe";

@NgModule({

    imports: [
        CommonModule,
        ReactiveFormsModule
    ],

    providers: [
        ToolbarAddNodeflowAgentService
    ],

    declarations: [
        ToolbarAddNodeflowComponent,
        FindCardCatalogResourcesPackagePipe,
        FindNodeflowCardProjectPackagePipe,
        LimitMessageBySocketPipe,
        AssetTypeOrderByPipe
    ],


    exports: [
        ToolbarAddNodeflowComponent
    ]


})
export class ToolbarAddNodeflowModule {
}


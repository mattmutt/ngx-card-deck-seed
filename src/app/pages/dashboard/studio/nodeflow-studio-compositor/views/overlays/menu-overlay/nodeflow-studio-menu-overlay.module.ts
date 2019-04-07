import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { NodeflowStudioMenuOverlayComponent } from "./nodeflow-studio-menu-overlay.component";

@NgModule({

    imports: [
        CommonModule
    ],
    declarations: [NodeflowStudioMenuOverlayComponent],
    exports: [NodeflowStudioMenuOverlayComponent]

})
export class NodeflowStudioMenuOverlayModule {
}


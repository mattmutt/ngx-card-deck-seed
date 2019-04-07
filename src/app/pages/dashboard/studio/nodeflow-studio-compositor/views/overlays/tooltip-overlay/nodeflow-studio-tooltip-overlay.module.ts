import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { NodeflowStudioTooltipOverlayComponent } from "./nodeflow-studio-tooltip-overlay.component";

@NgModule({

    imports: [
        CommonModule
    ],
    declarations: [NodeflowStudioTooltipOverlayComponent],
    exports: [NodeflowStudioTooltipOverlayComponent]

})
export class NodeflowStudioTooltipOverlayModule {
}


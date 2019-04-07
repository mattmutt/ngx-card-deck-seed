import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { NodeflowStudioNotificationOverlayComponent } from "./nodeflow-studio-notification-overlay.component";

@NgModule({

    imports: [
        CommonModule
    ],
    declarations: [NodeflowStudioNotificationOverlayComponent],
    exports: [NodeflowStudioNotificationOverlayComponent]

})
export class NodeflowStudioNotificationOverlayModule {
}

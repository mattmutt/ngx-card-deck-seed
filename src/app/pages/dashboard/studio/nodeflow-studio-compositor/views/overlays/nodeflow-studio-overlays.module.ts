import { NgModule } from "@angular/core";
import { NodeflowStudioMenuOverlayModule } from "./menu-overlay/nodeflow-studio-menu-overlay.module";
import { NodeflowStudioTooltipOverlayModule } from "./tooltip-overlay/nodeflow-studio-tooltip-overlay.module";
import { NodeflowStudioNotificationOverlayModule } from "./notification-overlay/nodeflow-studio-notification-overlay.module";
import { NodeflowStudioMenuOverlayComponent } from "./menu-overlay/nodeflow-studio-menu-overlay.component";
import { NodeflowStudioTooltipOverlayComponent } from "./tooltip-overlay/nodeflow-studio-tooltip-overlay.component";
import { NodeflowStudioNotificationOverlayComponent } from "./notification-overlay/nodeflow-studio-notification-overlay.component";

@NgModule({

    imports: [
        NodeflowStudioMenuOverlayModule,
        NodeflowStudioTooltipOverlayModule,
        NodeflowStudioNotificationOverlayModule
    ],

    exports: [
        NodeflowStudioMenuOverlayComponent,
        NodeflowStudioTooltipOverlayComponent,
        NodeflowStudioNotificationOverlayComponent
    ]


})
export class NodeflowStudioOverlaysModule {
}

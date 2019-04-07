import { NgModule } from '@angular/core';
import { NodeflowStudioCompositorComponent } from "./nodeflow-studio-compositor.component";
import { CommonModule } from "@angular/common";
import { NodeflowStudioConnectorGeometryService } from "./nodeflow-studio-connector-geometry.service";
import { NodeflowStudioCanvasLayoutService } from "./nodeflow-studio-canvas-layout.service";
import { NodeflowStudioShapeGeometryService } from "./nodeflow-studio-shape-geometry.service";
import { NodeflowStudioConnectorLoaderService } from "./nodeflow-studio-connector-loader.service";
import { NodeflowStudioGridStateManagerService } from "./nodeflow-studio-grid-state-manager.service";
import { SocketConnectorTypePipe } from "./state/transform/pipe/socket-connector-type.pipe";
import { NodeflowStudioCardNodeImporterService } from "./nodeflow-studio-card-node-importer.service";
import { NodeflowStudioOverlaysModule } from "./views/overlays/nodeflow-studio-overlays.module";
import { NodeflowStudioCardParseNotificationOverlayService } from "./nodeflow-studio-card-parse-notification-overlay.service";
import { NodeflowStudioSocketConnectorTooltipOverlayService } from "./nodeflow-studio-socket-connector-tooltip-overlay.service";
import { BrowserToolingModule } from "./utils/browser/browser-tooling.module";
import { NodeflowStudioSocketConnectorDragService } from "./nodeflow-studio-socket-connector-drag.service";
import { NODEFLOW_STUDIO_COMPOSITOR_CONFIG } from "./state/config/tokens";

import * as configurationJson from "./state/config/nodeflow-studio-compositor-configuration.json";


@NgModule({

    imports: [
        CommonModule,
        NodeflowStudioOverlaysModule,
        BrowserToolingModule
    ],

    declarations: [NodeflowStudioCompositorComponent, SocketConnectorTypePipe],

    providers: [
        NodeflowStudioGridStateManagerService,
        NodeflowStudioCardNodeImporterService,
        NodeflowStudioConnectorGeometryService,
        NodeflowStudioCanvasLayoutService,
        NodeflowStudioConnectorLoaderService,
        NodeflowStudioShapeGeometryService,
        NodeflowStudioCardParseNotificationOverlayService,
        NodeflowStudioSocketConnectorTooltipOverlayService,
        NodeflowStudioSocketConnectorDragService,

        {provide: NODEFLOW_STUDIO_COMPOSITOR_CONFIG, useValue: configurationJson.default}
    ],
    exports: [NodeflowStudioCompositorComponent]

})
export class NodeflowStudioCompositorModule {
}


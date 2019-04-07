import { AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, Renderer2 } from "@angular/core";
import { NodeflowStudioCanvasLayoutService } from "../../../nodeflow-studio-canvas-layout.service";
import { SocketConnectorType, SocketModel } from "../../../state/model/socket.model";
import { ContentProjectionProxyCommand } from "../nodeflow-studio-overlay-template.interface";
import { NodeflowStudioGridStateManagerService } from "../../../nodeflow-studio-grid-state-manager.service";
import { NodeModel } from "../../../state/model/node.model";
import { NODEFLOW_STUDIO_COMPOSITOR_CONFIG } from "../../../state/config/tokens";
import { StudioCompositorConfigurationSchema } from "../../../state/config/nodeflow-studio-compositor-configuration.interface";


const resources = {
    layout: {
        offsetFromTrigger: 10,
        showingClass: "show",
        triggerShowingDelay: 40,
        width: 50,
        maxWidth: 100,
        height: 20,
        maxHeight: 40
    }
};

@Component({
    selector: 'nodeflow-studio-tooltip-overlay',
    templateUrl: './nodeflow-studio-tooltip-overlay.html',
    styleUrls: ['./nodeflow-studio-tooltip-overlay.scss']
})
export class NodeflowStudioTooltipOverlayComponent implements OnDestroy, AfterViewInit {
    contentBoundingBox: ClientRect;

    @Input() node: NodeModel;
    @Input() socket: SocketModel;
    @Input() triggerElement: SVGPathElement;

    @Input() overlayCommand: ContentProjectionProxyCommand; // standard by contract

    constructor( @Inject(NODEFLOW_STUDIO_COMPOSITOR_CONFIG) private config: StudioCompositorConfigurationSchema,
                private element: ElementRef,
                private renderer: Renderer2,
                private canvasLayoutService: NodeflowStudioCanvasLayoutService,
                private gridStateManager: NodeflowStudioGridStateManagerService) {

    }

    ngAfterViewInit() {
        const gridElement = this.node.view.gridItem.gridster.el;
        const gridBCR = this.node.view.gridItem.gridster.el.getBoundingClientRect();
        const leftScroll = gridElement.scrollLeft;
        const topScroll = gridElement.scrollTop;
        const triggerBCR = this.triggerElement.getBoundingClientRect();

        this.contentBoundingBox = (this.element.nativeElement as HTMLDivElement).getBoundingClientRect();

        // centered and above trigger
        const left = triggerBCR.left + (this.socket.type === SocketConnectorType.input ? triggerBCR.width : 0) - gridBCR.left - (this.contentBoundingBox.width / 2) + leftScroll;
        const top = triggerBCR.top - gridBCR.top - this.contentBoundingBox.height + topScroll - resources.layout.offsetFromTrigger;

        this.renderer.setStyle(this.element.nativeElement, "left", left + "px");
        this.renderer.setStyle(this.element.nativeElement, "top", top + "px");

        // slight wait before showing tooltip
        setTimeout(() => {
            this.renderer.addClass(this.element.nativeElement, resources.layout.showingClass);
        }, resources.layout.triggerShowingDelay);

    }

    displaySocketConnectorType(type: SocketConnectorType) {
        return {
            [SocketConnectorType.input]: "Input",
            [SocketConnectorType.output]: "Output"
        }[type];
    }


    get isSocketConnectorEstablished(): boolean {
        return this.gridStateManager.routes.isSocketConnected(this.socket);
    }


    ngOnDestroy() {

    }

}


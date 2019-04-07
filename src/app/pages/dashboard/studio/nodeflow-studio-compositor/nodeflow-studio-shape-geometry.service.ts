import { Inject, Injectable } from "@angular/core";
import { NodeflowStudioCanvasLayoutService } from "./nodeflow-studio-canvas-layout.service";
import { NodeSegmentConnector, NodeSegmentCoordinate } from "./state/model/compositor.interface";
import { SocketConnectorType, SocketLayoutOrientationType, SocketModel } from "./state/model/socket.model";
import { NodeModel } from "./state/model/node.model";
import { NodeflowStudioConnectorGeometryService } from "./nodeflow-studio-connector-geometry.service";
import { NODEFLOW_STUDIO_COMPOSITOR_CONFIG } from "./state/config/tokens";
import { StudioCompositorConfigurationSchema } from "./state/config/nodeflow-studio-compositor-configuration.interface";


interface SocketGeometryLayout {
    mainAxisOrientationModifier: number; // (horizontal: { left -1, right 1 } )  (vertical: top: -1, bottom 1 )
    isCondensed: boolean;
    condensingFactor: number;
    relativeCrossAxisPosition: number;
    centerCrossAxisPosition: number;
}

// asset definitions
const resources = {
    geometry: {
        radian2degree: 180 / Math.PI,
        orientation: SocketLayoutOrientationType.horizontal
    }
};

// drawing routines
@Injectable()
export class NodeflowStudioShapeGeometryService {

    constructor(
        @Inject(NODEFLOW_STUDIO_COMPOSITOR_CONFIG) private config: StudioCompositorConfigurationSchema,
        private canvasLayoutService: NodeflowStudioCanvasLayoutService,
        private connectorGeometryService: NodeflowStudioConnectorGeometryService) {

        // configure orientation
        resources.geometry.orientation = SocketLayoutOrientationType[config.component.compositor.socket.orientation] || resources.geometry.orientation;
    }

    // arrowhead shape
    drawConnectorArrowPoints(): Array<number> {
        const shape = this.config.asset.arrow;

        return [
            shape.layout.width / 2, 0,
            shape.layout.width, shape.layout.height,
            shape.layout.width / 2, shape.layout.height * .85,
            0, shape.layout.height
        ].map((val) => this.canvasLayoutService.filterScalarPoint(val, shape.layout.scalable));

    }

    // node holds plugs which act as ports for message transmission
    drawNodeSocketPathGeometry(socket: SocketModel, node: NodeModel, sequence: number, collectionSize: number): string {
        const socketWidth = this.config.asset.socket.layout.size;
        const geometryLayout = this.calculateSocketGeometryLayout(socket, node, sequence, collectionSize); //socket position
        const allocatedElementSize = socketWidth + (1 * this.config.asset.socket.layout.padding); // inset
        const moveToCrossAxisPosition = geometryLayout.centerCrossAxisPosition + (geometryLayout.mainAxisOrientationModifier * allocatedElementSize / 2);
        const arcSize = geometryLayout.isCondensed ? 2 : 1; // deform socket with a stretch for visibility
        //const orientationBasedOffset = geometryLayout.mainAxisOrientationModifier === -1 ? socketWidth / 2 : 0;
        const orientationBasedOffset = socketWidth / 2 / (geometryLayout.isCondensed ? 2 : 1);


        let socketStartX;
        let socketStartY;
        let arcEnding: Array<number>;
        let arcSizeTuple: Array<number>;

        const crossAxisOffset = orientationBasedOffset + moveToCrossAxisPosition;

        if (resources.geometry.orientation === SocketLayoutOrientationType.horizontal) {
            // horizontal
            socketStartX = socket.view.nodeSegmentCoordinate.x;

            socketStartY = geometryLayout.relativeCrossAxisPosition;
            socketStartY += crossAxisOffset;
            // outputs visible curvature on right
            arcEnding = [0, -geometryLayout.mainAxisOrientationModifier * socketWidth * geometryLayout.condensingFactor];
            arcSizeTuple = [arcSize, 1];

        } else {

            // vertical
            socketStartX = socket.view.nodeSegmentCoordinate.x + geometryLayout.relativeCrossAxisPosition;

            //real time while dragging
            socketStartY = socket.view.nodeSegmentCoordinate.y;

            // the logical Y position is centered on the nodeSegmentCoordinate
            const gridItemHalfHeight = socket.view.nodeSegmentCoordinate.gridItem.el.offsetHeight / 2;
            const gridItemHalfWidth = socket.view.nodeSegmentCoordinate.gridItem.el.offsetWidth / 2;

            // move to edge of node
            if (socket.type === SocketConnectorType.input) {
                socketStartX += gridItemHalfWidth + socketWidth;
                socketStartY -= gridItemHalfHeight;
            } else {
                socketStartX -= gridItemHalfWidth;
                socketStartY += gridItemHalfHeight;
            }

            // outputs visible curvature on bottom
            arcEnding = [geometryLayout.mainAxisOrientationModifier * socketWidth * geometryLayout.condensingFactor, 0];
            arcSizeTuple = [1, arcSize];
        }

        // update socket view coordinate space
        socket.view.onRendered(socketStartX + (orientationBasedOffset), socketStartY + (orientationBasedOffset), geometryLayout.isCondensed);

        return `M ${socketStartX} ${socketStartY} a${arcSizeTuple} 0 0,0 ${arcEnding}`;
    }

    // calculate latest position of node box
    updateNodePosition(nodeSegmentCoordinate: NodeSegmentCoordinate): void {

        nodeSegmentCoordinate.x = this.connectorGeometryService.calculateNodePositionLeft(nodeSegmentCoordinate);
        nodeSegmentCoordinate.y = this.connectorGeometryService.calculateNodePositionTop(nodeSegmentCoordinate);
    }

    /**
     * directional arrow tangential to the path's centroid
     */
    transformConnectorArrowRotation(connector: NodeSegmentConnector, linkPathSVGElement: SVGPathElement): string {
        const shape = this.config.asset.arrow;
        const arrowHeadOrientation = 90;
        let deg = 0;

        const pathLength = linkPathSVGElement.getTotalLength();
        if (pathLength) { // path resolvable? lifecycle sequencing could be not ready state
            const offset = pathLength / 1000000;

            const p1 = linkPathSVGElement.getPointAtLength(pathLength / 2 - offset);
            const p2 = linkPathSVGElement.getPointAtLength(pathLength / 2 + offset);

            deg = Math.atan2(p1.y - p2.y, p1.x - p2.x) * resources.geometry.radian2degree;

        } else {
            // ----- failover when unavailable --------
            // delta y over delta x
            deg = Math.atan2((connector.end.y - connector.start.y), (connector.end.x - connector.start.x)) * resources.geometry.radian2degree;
            deg += 180;
        }

        return this.canvasLayoutService.generateSVGRotateSpace(arrowHeadOrientation + deg,
            this.canvasLayoutService.filterScalarPoint(shape.layout.width / 2, shape.layout.scalable),
            this.canvasLayoutService.filterScalarPoint(shape.layout.height / 2, shape.layout.scalable)
        );

    }

    /**
     * clickable box on the path's midpoint
     */
    transformConnectorArrowCentroid(connector: NodeSegmentConnector, linkPathSVGElement: SVGPathElement): string | undefined {
        const shape = this.config.asset.arrow;
        const midLength = linkPathSVGElement.getTotalLength() / 2;

        // Firefox tries to render SVG paths that are zero-length
        if (!midLength) {
            return;
        }

        const centroid = linkPathSVGElement.getPointAtLength(midLength);

        const middle = {
            x: centroid.x - this.canvasLayoutService.filterScalarPoint(shape.layout.width / 2, shape.layout.scalable),
            y: centroid.y - this.canvasLayoutService.filterScalarPoint(shape.layout.height / 2, shape.layout.scalable)
        };

        return this.canvasLayoutService.generateSVGTransformSpace(middle.x, middle.y);
    }


    // responsive layout logic for determining position and order of the socket within the displayed set of sockets
    public calculateSocketGeometryLayout(socketRef: SocketModel, node: NodeModel, sequence: number, collectionSize: number): SocketGeometryLayout {
        const socketOrientatationType = resources.geometry.orientation;
        const nsc = socketRef.view.nodeSegmentCoordinate;

        // evaluate RWD potential
        const firstItemStackStartPosition = this.findSocketStackPositionPoint(socketRef, node, 0, collectionSize, 1);
        const isCondensed = this.isCondensingSocketLayout(socketRef, node, firstItemStackStartPosition);
        const condensingFactor = isCondensed ? 1 / this.config.asset.socket.layout.smallCondensingFactor : 1;

        // account for condensing factor
        // for other multiple sockets, look up respective positioning in sequence chain
        const relativePositionInCollection = this.findSocketStackPositionPoint(socketRef, node, sequence, collectionSize, condensingFactor);

        return {
            mainAxisOrientationModifier: socketRef.type === SocketConnectorType.input ? -1 : 1,
            isCondensed: isCondensed,
            condensingFactor: condensingFactor,
            relativeCrossAxisPosition: relativePositionInCollection,
            centerCrossAxisPosition: socketOrientatationType === SocketLayoutOrientationType.horizontal
                ? nsc.y
                : nsc.x + (nsc.gridItem.itemWidth / 2)
        };

    }


    // responsive check
    private isCondensingSocketLayout(socketRef: SocketModel, node: NodeModel, firstItemStartPosition: number): boolean {
        const socketOrientatationType = resources.geometry.orientation;
        const nsc = socketRef.view.nodeSegmentCoordinate;

        let b = false;
        if (
            // ---- horizontal responsive ----
            (socketOrientatationType === SocketLayoutOrientationType.horizontal &&
                ((nsc.y + firstItemStartPosition) < this.connectorGeometryService.calculateItemPositionTop(node.view.gridItem)))
            ||
            // ---- vertical responsive ----
            (socketOrientatationType === SocketLayoutOrientationType.vertical &&
                ((nsc.x + (nsc.gridItem.el.offsetWidth / 2) + firstItemStartPosition) < this.connectorGeometryService.calculateItemPositionLeft(node.view.gridItem)))

        ) {
            b = true;
        }

        return b;
    }


    // physical location of a socket, accounting for space within its collection entirety
    private findSocketStackPositionPoint(socket: SocketModel, node: NodeModel, sequence: number, collectionSize: number, packingFactor: number): number {
        const socketWidth = this.config.asset.socket.layout.size;
        const allocatedElementSize = socketWidth + (2 * this.config.asset.socket.layout.padding);
        const allocatedSetLayoutSize = collectionSize * allocatedElementSize - (2 * this.config.asset.socket.layout.padding);

        //return (sequence * ((this.config.asset.socket.layout.padding + socketWidth) * packingFactor)) - ((collectionSize - (1)) * (socketWidth * packingFactor) / 2);
        return (sequence * allocatedElementSize * packingFactor) - (allocatedSetLayoutSize * packingFactor / 2);
    }

}

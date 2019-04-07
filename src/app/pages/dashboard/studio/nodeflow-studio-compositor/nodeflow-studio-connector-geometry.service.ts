import { Inject, Injectable } from "@angular/core";
import { NodeSegmentConnector, NodeSegmentCoordinate } from "./state/model/compositor.interface";
import { SocketConnectorType, SocketLayoutOrientationType, SocketModel } from "./state/model/socket.model";
import { NodeLinkModel, NodeModel } from "./state/model/node.model";
import { NODEFLOW_STUDIO_COMPOSITOR_CONFIG } from "./state/config/tokens";
import { GridContainerDashboardContainerComponent } from "ngx-card-deck";
import {
    GridsterComponent,
    GridsterItemComponentInterface
} from "ngx-card-deck";
import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade,
    ViewAssemblyTypeStateResourceLayoutItemSchema
} from "ngx-card-deck";
import { StudioCompositorConfigurationSchema } from "./state/config/nodeflow-studio-compositor-configuration.interface";


interface NodeSegmentConnectorCoordinateSpace {
    x: number;
    y: number;
}

interface PlugGeometryLayout {
    mainAxisOrientationModifier: number; // (horizontal: { left -1, right 1 } )  (vertical: top: -1, bottom 1 )
    isCondensed: boolean;
    condensingFactor: number;
    relativeCrossAxisPosition: number;
    relativeStartCrossAxisPosition: number;
}


// asset definitions
const resources = {
    geometry: {
        orientation: SocketLayoutOrientationType.horizontal
    }
};


@Injectable()
export class NodeflowStudioConnectorGeometryService {
    private gridContainerAssembly: GridContainerDashboardContainerComponent;
    private gridWidget: GridsterComponent;

    constructor(@Inject(NODEFLOW_STUDIO_COMPOSITOR_CONFIG) private config: StudioCompositorConfigurationSchema) {

        // configure orientation
        resources.geometry.orientation = SocketLayoutOrientationType[config.component.compositor.socket.orientation] || resources.geometry.orientation;
    }

    setGridWidget(gw: GridsterComponent) {
        this.gridWidget = gw;
    }


    setGridContainerAssembly(gca: GridContainerDashboardContainerComponent) {
        this.gridContainerAssembly = gca;
    }


    // view update triggered on layout changes
    updateSegmentConnectorLayout(connector: NodeSegmentConnector): void {
        connector.start.x = this.calculateNodePositionLeft(connector.start);
        connector.start.y = this.calculateNodePositionTop(connector.start);

        connector.end.x = this.calculateNodePositionLeft(connector.end);
        connector.end.y = this.calculateNodePositionTop(connector.end);

        // connector.start.x = this.calculateNodePositionMainAxisStart(connector.start);
        // connector.start.y = this.calculateNodePositionCrossAxisStart(connector.start);
        //
        // connector.end.x = this.calculateNodePositionMainAxisStart(connector.end);
        // connector.end.y = this.calculateNodePositionCrossAxisStart(connector.end);


        connector.geometry.path = this.drawConnectorPathGeometry(connector);
    }


    /*
    calculateItemMainAxisStart(item: GridsterItemComponentInterface): number {

        return resources.geometry.orientation === SocketLayoutOrientationType.horizontal
            ? this.calculateItemPositionLeft(item)
            : this.calculateItemPositionTop(item);
    }

    // neutral API that respects orientation
    calculateItemCrossAxisStart(item: GridsterItemComponentInterface): number {

        return resources.geometry.orientation === SocketLayoutOrientationType.horizontal
            ? this.calculateItemPositionTop(item)
            : this.calculateItemPositionLeft(item);
    }

    calculateNodePositionMainAxisStart(segmentCoordinate: NodeSegmentCoordinate): number {

        return resources.geometry.orientation === SocketLayoutOrientationType.horizontal
            ? this.calculateNodePositionLeft(segmentCoordinate)
            : this.calculateNodePositionTop(segmentCoordinate);
    }

    calculateNodePositionCrossAxisStart(segmentCoordinate: NodeSegmentCoordinate): number {

        return resources.geometry.orientation === SocketLayoutOrientationType.horizontal
            ? this.calculateNodePositionTop(segmentCoordinate)
            : this.calculateNodePositionLeft(segmentCoordinate);
    }

    getNodeItemMainAxisLength(nodeItem: GridsterItemComponentInterface): number {
        return resources.geometry.orientation === SocketLayoutOrientationType.horizontal
            ? nodeItem.el.clientWidth
            : nodeItem.el.clientHeight;

    }

    getNodeItemCrossAxisLength(nodeItem: GridsterItemComponentInterface): number {
        return resources.geometry.orientation === SocketLayoutOrientationType.horizontal
            ? nodeItem.el.clientHeight
            : nodeItem.el.clientWidth;

    }
    */

    // extract the card metadata, given a gridster item
    fetchCardMetadata(gi: GridsterItemComponentInterface): DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema> {
        return this.gridContainerAssembly.assemblyState.materializedModelList.find((o) => o.facade === gi.item)!.card;
    }

    // locator query for the GridsterItemComponent By layout schema of coordinates
    findGridsterItemComponent(layout: ViewAssemblyTypeStateResourceLayoutItemSchema): GridsterItemComponentInterface | undefined {
        const gridsterItem = this.gridWidget.findItemWithItem(layout.layout);
        return (typeof gridsterItem !== "boolean") ? gridsterItem : undefined;
    }

    // coordinate-node linkage
    generateItemConnectorCoordinate(nodeActor: NodeModel, socketActor: SocketModel): NodeSegmentCoordinate {

        const partialSegment = {
            card: this.fetchCardMetadata(nodeActor.view.gridItem),
            gridItem: nodeActor.view.gridItem,
            organizer: {
                socket: socketActor,
                collection: nodeActor.link!.getCollectionByType(socketActor.type)
            }
        };

        const segmentCoordinate: NodeSegmentCoordinate = Object.assign(partialSegment, {
            x: this.calculateNodePositionLeft(partialSegment as NodeSegmentCoordinate),
            y: this.calculateNodePositionTop(partialSegment as NodeSegmentCoordinate)
        });

        return segmentCoordinate;
    }

    drawConnectorPathGeometry(connector: NodeSegmentConnector): string {
        const straightnessThresholdSlope = 50; // deviation in pixels to qualify as "straight"
        const reversedConnectorSlopeRuleThreshold = .5; // node placed in an unnatural reversed position
        const nodeItem1 = connector.start.gridItem;
        const geometryBox1 = {
            x: this.calculateItemPositionLeft(nodeItem1), y: this.calculateItemPositionTop(nodeItem1),
            width: nodeItem1.el.clientWidth, height: nodeItem1.el.clientHeight

            // x: this.calculateItemMainAxisStart(nodeItem1), y: this.calculateItemCrossAxisStart(nodeItem1),
            // width: this.getNodeItemMainAxisLength(nodeItem1), height: this.getNodeItemCrossAxisLength(nodeItem1)

        };

        const nodeItem2 = connector.end.gridItem;
        const geometryBox2 = {
            x: this.calculateItemPositionLeft(nodeItem2), y: this.calculateItemPositionTop(nodeItem2),
            width: nodeItem2.el.clientWidth, height: nodeItem2.el.clientHeight

            // x: this.calculateItemMainAxisStart(nodeItem2), y: this.calculateItemCrossAxisStart(nodeItem2),
            // width: this.getNodeItemMainAxisLength(nodeItem2), height: this.getNodeItemCrossAxisLength(nodeItem2)

        };

        const geometryBoundaryList = [
            {x: geometryBox1.x + geometryBox1.width / 2, y: geometryBox1.y - 1}, // upper-center distribution quadrant
            {x: geometryBox1.x + geometryBox1.width / 2, y: geometryBox1.y + geometryBox1.height + 1}, // lower-center distribution quadrant

            {x: geometryBox1.x - 1, y: geometryBox1.y + geometryBox1.height / 2}, // center-left distribution quadrant
            {x: geometryBox1.x + geometryBox1.width + 1, y: geometryBox1.y + geometryBox1.height / 2}, // center-right distribution quadrant

            {x: geometryBox2.x + geometryBox2.width / 2, y: geometryBox2.y - 1},
            {x: geometryBox2.x + geometryBox2.width / 2, y: geometryBox2.y + geometryBox2.height + 1},
            {x: geometryBox2.x - 1, y: geometryBox2.y + geometryBox2.height / 2},
            {x: geometryBox2.x + geometryBox2.width + 1, y: geometryBox2.y + geometryBox2.height / 2}
        ];

        const inputRes = [2, 6]; //  position: left center
        const outputRes = [3, 7]; //  position: right center

        const x4 = geometryBoundaryList[inputRes[0]].x;
        const y4 = geometryBoundaryList[inputRes[0]].y;
        const x1 = geometryBoundaryList[outputRes[1]].x;
        const y1 = geometryBoundaryList[outputRes[1]].y;

        let dx = ((geometryBox1.x + geometryBox1.width) - (geometryBox2.x));
        let dy = (y4 - y1) / 2;

        if (resources.geometry.orientation === SocketLayoutOrientationType.vertical) {
            dx = (geometryBox1.x + geometryBox1.width / 2) - (geometryBox2.x + geometryBox2.width / 2);
            dy = nodeItem2.itemTop - (nodeItem1.itemTop + nodeItem1.itemHeight);
        }

        // almost straight line?
        const isConnectorToSocketsStraight = resources.geometry.orientation === SocketLayoutOrientationType.horizontal
            ? Math.abs(dy) < straightnessThresholdSlope : Math.abs(dx) < straightnessThresholdSlope;

        // strategy for connector will reduce to simple line when gridsterItemList are very close
        const vectorLength = (Math.abs(dx) ** 2 + Math.abs(dy) ** 2) ** 0.5;

        // const slopeDy = resources.geometry.orientation === SocketLayoutOrientationType.horizontal ? geometryBox2.y - geometryBox1.y
        const slopeDy = geometryBox2.y - geometryBox1.y;

        //const slopeDx = geometryBox2.x - (geometryBox1.x + geometryBox1.width); // edge
        const slopeDx = geometryBoundaryList[7].x - geometryBoundaryList[3].x; // edge

        // responsive layout logic for determining position and order of the plug within the displayed set of sockets
        const startPlugGeometry = this.calculatePlugGeometryLayout(connector.start.organizer.socket, connector.start.organizer.collection);
        const endPlugGeometry = this.calculatePlugGeometryLayout(connector.end.organizer.socket, connector.end.organizer.collection);

        const isConnectorBackwards = resources.geometry.orientation === SocketLayoutOrientationType.horizontal
            ? slopeDx < 0 && (slopeDy === 0 || (Math.abs(slopeDy / slopeDx) < reversedConnectorSlopeRuleThreshold))
            : slopeDy < 0 && (slopeDx === 0 || (Math.abs(slopeDy / slopeDx) < reversedConnectorSlopeRuleThreshold));

        // unwrap potentially awkward "knot" and
        if (isConnectorBackwards) {
            return this.deriveConnectorGeometryLoopbackPath(connector, geometryBoundaryList, vectorLength, startPlugGeometry, endPlugGeometry);
        }


        return (isConnectorToSocketsStraight || vectorLength <= this.config.asset.connector.layout.lineProximityThreshold)
            ? this.deriveConnectorGeometryLinePath(connector, geometryBoundaryList, vectorLength, startPlugGeometry, endPlugGeometry)
            : this.deriveConnectorGeometryBezierPath(connector, geometryBoundaryList, vectorLength, startPlugGeometry, endPlugGeometry);

    }

    // geometry drawing calculation : bezier curve algorithm
    deriveConnectorGeometryBezierPath(connector: NodeSegmentConnector, boundaryList: Array<NodeSegmentConnectorCoordinateSpace>, connectorSegmentsDistance: number, startGeometry: PlugGeometryLayout, endGeometry: PlugGeometryLayout): string {
        const minimumStrength = this.gridWidget.scaleInteractionEventCoordinate(100); // forced segment to travel before curving backward
        // const dis = [];
        let dx, dy;

        // changes in x,y
        for (let i = 0; i < 4; i++) {
            for (let j = 4; j < 8; j++) {
                dx = Math.abs(boundaryList[i].x - boundaryList[j].x);
                dy = Math.abs(boundaryList[i].y - boundaryList[j].y);
                //dis.push(dx + dy);
            }
        }

        const [x1, y1, x4, y4] = this.derivePlugRelationCoordinates(connector, connectorSegmentsDistance, startGeometry, endGeometry);


        dx = Math.max(Math.abs(x1 - x4) / 1.05, minimumStrength);
        // dy = Math.max(Math.abs(y1 - y4) / 2, minimumStrength);

        // -------- horizontal orientation curve -------------
        if (resources.geometry.orientation === SocketLayoutOrientationType.horizontal) {

            const x2 = x1 - dx,
                y2 = y1,
                x3 = x4 + dx,
                y3 = y4;

            return ["M" + x1, y1 + "C" + x2, y2, x3, y3, x4, y4].join(",");

        } else {

            const isConnectorHorizontallyFlat = dy === 0;

            // -------- vertical orientation curve -------------
            const x2 = x1,
                y2 = y4,
                x3 = x4,
                y3 = y1;

            return !isConnectorHorizontallyFlat
                // normal
                ? ["M" + x1, y1 + "C" + x2, y2, x3, y3, x4, y4].join(",")
                : ["M" + x1, y1 + "C" + (x1 - dx), (y2 - (connector.start.gridItem.el.offsetHeight)), (x4 + dx), (y3 + (connector.end.gridItem.el.offsetHeight)), x4, y4].join(",");

        }

    }

    // edge case to avoid nodes in a reversed position - will wrap around
    deriveConnectorGeometryLoopbackPath(connector: NodeSegmentConnector, boundaryList: Array<NodeSegmentConnectorCoordinateSpace>, connectorSegmentsDistance: number, startGeometry: PlugGeometryLayout, endGeometry: PlugGeometryLayout): string {
        const curvePaddingAroundNodeEdge = .09;
        const curveExpansionRatio = 0.2;
        const dis = [];
        let dx, dy;

        // changes in x,y
        for (let i = 0; i < 4; i++) {
            for (let j = 4; j < 8; j++) {
                dx = Math.abs(boundaryList[i].x - boundaryList[j].x);
                dy = Math.abs(boundaryList[i].y - boundaryList[j].y);
                dis.push(dx + dy);
            }
        }

        const [x1, y1, x4, y4] = this.derivePlugRelationCoordinates(connector, connectorSegmentsDistance, startGeometry, endGeometry);


        // dx = Math.max(Math.abs(x1 - x4) / 2, minimumStrength);
        //dx = ((boundaryList[2].x + geometryBox1.width) - (geometryBox2.x));
        // dx = (boundaryList[7].x - boundaryList[3].x); // edge
        dx = Math.abs(boundaryList[7].x - boundaryList[3].x); // edge

        if (resources.geometry.orientation === SocketLayoutOrientationType.horizontal) {
            const x2 = ((x1 - dx) + -(connector.start.gridItem.itemWidth * curveExpansionRatio)),
                y2 = (y1 - 2 * connector.start.gridItem.itemHeight / (1 + curvePaddingAroundNodeEdge)),
                x3 = ((x4 + dx + (connector.end.gridItem.itemWidth * curveExpansionRatio))),
                y3 = (y4 - connector.end.gridItem.itemHeight / (1 + curvePaddingAroundNodeEdge));

            return ["M" + x1, y1 + "C" + x2, y2, x3, y3, x4, y4].join(",");

            // -------- vertical orientation curve -------------
        } else {

            const vectorDirection = x4 - x1; // vector
            const vectorModifier = vectorDirection < 0 ? -1 : 1;

            const x2 = ((x1 + (vectorModifier * dx)) + -(connector.start.gridItem.itemWidth * curveExpansionRatio)),
                y2 = (y1 - connector.start.gridItem.itemHeight / (1 + curvePaddingAroundNodeEdge)),
                x3 = ((x4 + -(vectorModifier * dx) + (connector.end.gridItem.itemWidth * curveExpansionRatio))),
                y3 = (y4 + connector.end.gridItem.itemHeight / (1 + curvePaddingAroundNodeEdge));

            return ["M" + x1, y1 + "C" + x2, y2, x3, y3, x4, y4].join(",");

        }
    }

    // geometry drawing calculation : line algorithm
    deriveConnectorGeometryLinePath(connector: NodeSegmentConnector, boundaryList: Array<NodeSegmentConnectorCoordinateSpace>, connectorSegmentsDistance: number, startGeometry: PlugGeometryLayout, endGeometry: PlugGeometryLayout): string {
        const dis = [];
        let dx, dy;

        // changes in x,y
        for (let i = 0; i < 4; i++) {
            for (let j = 4; j < 8; j++) {
                dx = Math.abs(boundaryList[i].x - boundaryList[j].x);
                dy = Math.abs(boundaryList[i].y - boundaryList[j].y);
                dis.push(dx + dy);
            }
        }

        const [x1, y1, x4, y4] = this.derivePlugRelationCoordinates(connector, connectorSegmentsDistance, startGeometry, endGeometry);

        // vector
        return ["M" + x1, y1 + "L" + x4, y4].join(",");
    }


    // -------------- connection geometry -------------

    // get absolute coordinate
    calculateItemPositionLeft(item: GridsterItemComponentInterface): number {
        const margin = this.gridWidget.$options.margin;
        return this.gridWidget.descaleInteractionEventCoordinate(item.el.offsetLeft - margin);
    }

    // go private?
    calculateItemPositionTop(item: GridsterItemComponentInterface): number {
        const margin = this.gridWidget.$options.margin;
        return this.gridWidget.descaleInteractionEventCoordinate(item.el.offsetTop - margin);
    }

    // geometry
    calculateNodePositionLeft(segmentCoordinate: NodeSegmentCoordinate): number {
        const inProgressDrag = this.gridWidget.movingItem;
        const gi = segmentCoordinate.gridItem;
        let x: number = this.calculateItemPositionLeft(gi);

        switch (segmentCoordinate.organizer.socket.type) {

            case SocketConnectorType.input:
                // connection originates the segment
                break;

            case SocketConnectorType.output:
                const realizedWidth = (inProgressDrag === gi.$item) ? gi.el.clientWidth : gi.width; // clientWidth expensive
                // connection originates the segment
                x += realizedWidth;
                break;

            default:
                // fail through
                break;

        }

        return x;
    }

    // geometry
    calculateNodePositionTop(segmentCoordinate: NodeSegmentCoordinate): number {
        const inProgressDrag = this.gridWidget.movingItem;
        const gi = segmentCoordinate.gridItem;

        const realizedHeight = (inProgressDrag === gi.$item) ? gi.el.clientHeight : gi.height; // querying clientHeight expense
        const y: number = this.calculateItemPositionTop(gi) + realizedHeight / 2; // best centered

        switch (segmentCoordinate.organizer.socket.type) {

            case SocketConnectorType.input:
                // connection originates the segment
                break;

            case SocketConnectorType.output:
                // connection originates the segment
                // y +=  item.height / 4; // sloped
                break;

            default:
                // fail through
                break;

        }

        return y;
    }

    // four points that define the connector path's start and end points. They are switched For algebraic reasons
    private derivePlugRelationCoordinates(connector: NodeSegmentConnector, connectorSegmentsDistance: number, startGeometry: PlugGeometryLayout, endGeometry: PlugGeometryLayout): [number, number, number, number] {

        if (resources.geometry.orientation === SocketLayoutOrientationType.horizontal) {

            return [
                //input
                connector.end.x,
                connector.end.y - (connector.end.gridItem.el.offsetHeight / 2) + endGeometry.relativeStartCrossAxisPosition + endGeometry.relativeCrossAxisPosition,

                // output
                connector.start.x,
                connector.start.y - (connector.start.gridItem.el.offsetHeight / 2) + startGeometry.relativeStartCrossAxisPosition + startGeometry.relativeCrossAxisPosition
            ];

        } else if (resources.geometry.orientation === SocketLayoutOrientationType.vertical) {

            return [
                connector.end.x + endGeometry.relativeStartCrossAxisPosition + endGeometry.relativeCrossAxisPosition,
                connector.end.y - (connector.end.gridItem.el.offsetHeight / 2),
                // output
                connector.start.x - connector.start.gridItem.el.offsetWidth + startGeometry.relativeStartCrossAxisPosition + startGeometry.relativeCrossAxisPosition,
                connector.start.y + (connector.start.gridItem.el.offsetHeight / 2)
            ];

        } else {
            // unknown
            return [0, 0, 0, 0];
        }

    }


    // responsive layout logic for determining position and order of the socket within the displayed set of sockets
    private calculatePlugGeometryLayout(socketRef: SocketModel, socketCollection: Set<SocketModel>): PlugGeometryLayout {
        const orderedCollection = NodeLinkModel.sortCollection(socketCollection); // consistency standard
        const itemSequence = orderedCollection.indexOf(socketRef);

        // evaluate RWD potential
        const isCondensed = socketRef.view.renderedNotation.isCondensed;
        const condensingFactor = isCondensed ? 1 / this.config.asset.socket.layout.smallCondensingFactor : 1;

        // account for condensing factor
        // for other multiple sockets, look up respective positioning in sequence chain
        const relativePositionInCollection = this.findPlugStackPositionPoint(socketRef, itemSequence, orderedCollection, condensingFactor);

        return {
            mainAxisOrientationModifier: socketRef.type === SocketConnectorType.input ? -1 : 1,
            isCondensed: isCondensed,
            condensingFactor: condensingFactor,
            relativeCrossAxisPosition: relativePositionInCollection,
            // relative to the edge
            relativeStartCrossAxisPosition: this.findPlugStackRelativeStartPoint(socketRef, itemSequence, orderedCollection, condensingFactor)
        };

    }

    private findPlugStackRelativeStartPoint(socket: SocketModel, sequence: number, socketCollection: Array<SocketModel>, packingFactor: number): number {
        const isHorizontal = (resources.geometry.orientation === SocketLayoutOrientationType.horizontal);

        const boxMainAxisLength = (isHorizontal)
            ? socket.view.nodeSegmentCoordinate.gridItem.el.offsetHeight
            : socket.view.nodeSegmentCoordinate.gridItem.el.offsetWidth;

        const socketWidth = this.config.asset.socket.layout.size;
        const allocatedElementSize = socketWidth + (2 * this.config.asset.socket.layout.padding);
        const setWidth = (socketCollection.length * allocatedElementSize * packingFactor);

        return (boxMainAxisLength - setWidth) / 2;
    }

    // called twice, first time is for initial sizing efforts
    // physical centroid point of a plug socket on the connector, accounting for its position in the collection
    private findPlugStackPositionPoint(socket: SocketModel, sequence: number, socketCollection: Array<SocketModel>, packingFactor: number): number {
        const socketWidth = this.config.asset.socket.layout.size; // plug is smaller than reference socket
        const allocatedElementSize = socketWidth + (2 * this.config.asset.socket.layout.padding);
        return (sequence * allocatedElementSize * packingFactor) + (this.config.asset.socket.layout.padding + socketWidth / 2);
    }

    /*
    dynamic side attachment algorithm - unused at the moment, but the geometry equations are helpful
    drawConnectorPath(connector: NodeSegmentConnector): string {
        const bb1 = connector.start.gridItem;
        const bb2 = connector.end.gridItem;

        const bbx1 = {
            x: this.connectorPlannerService.calculateItemPositionLeft(bb1),
            y: this.connectorPlannerService.calculateItemPositionTop(bb1),
            width: bb1.el.clientWidth, height: bb1.el.clientHeight
        };

        const bbx2 = {
            x: this.connectorPlannerService.calculateItemPositionLeft(bb2),
            y: this.connectorPlannerService.calculateItemPositionTop(bb2),
            width: bb2.el.clientWidth, height: bb2.el.clientHeight
        };

        const minimumStrength = 150; // forced segment to travel before curving backward

        let dx, dy;

        const p = [{x: bbx1.x + bbx1.width / 2, y: bbx1.y - 1},
                {x: bbx1.x + bbx1.width / 2, y: bbx1.y + bbx1.height + 1},
                {x: bbx1.x - 1, y: bbx1.y + bbx1.height / 2},
                {x: bbx1.x + bbx1.width + 1, y: bbx1.y + bbx1.height / 2},

                {x: bbx2.x + bbx2.width / 2, y: bbx2.y - 1},
                {x: bbx2.x + bbx2.width / 2, y: bbx2.y + bbx2.height + 1},
                {x: bbx2.x - 1, y: bbx2.y + bbx2.height / 2},
                {x: bbx2.x + bbx2.width + 1, y: bbx2.y + bbx2.height / 2}],
            d = {}, dis = [];

        for (let i = 0; i < 4; i++) {
            for (let j = 4; j < 8; j++) {
                dx = Math.abs(p[i].x - p[j].x);
                dy = Math.abs(p[i].y - p[j].y);
                if ((i === j - 4) || (((i !== 3 && j !== 6) || p[i].x < p[j].x) && ((i !== 2 && j !== 7) || p[i].x > p[j].x) && ((i !== 0 && j !== 5) || p[i].y > p[j].y) && ((i !== 1 && j !== 4) || p[i].y < p[j].y))) {
                    dis.push(dx + dy);
                    d[dis[dis.length - 1]] = [i, j];
                }
            }
        }
        // res bounding
        const res = dis.length ? d[Math.min.apply(Math, dis)] : [0, 4];

        const x1 = p[res[0]].x,
            y1 = p[res[0]].y,
            x4 = p[res[1]].x,
            y4 = p[res[1]].y;

        dx = Math.max(Math.abs(x1 - x4) / 2, minimumStrength);
        dy = Math.max(Math.abs(y1 - y4) / 2, minimumStrength);

        const x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
            y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
            x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
            y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);

        const path = ["M" + x1.toFixed(3), y1.toFixed(3), "C" + x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");

        return path;
    }
    */

}

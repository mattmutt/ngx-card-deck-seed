import { SocketModel } from "./socket.model";
import { NodeModel } from "./node.model";
import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { GridsterItemComponentInterface } from "ngx-card-deck";

// producing message in various connectivity phases for transport over socket connector
// not persisted
export enum NodeSegmentInteractionMessagingState {
    none = 1,
    connect,
    transmit,
    error
}

// potential segment drag/reassign states
// not persisted
export enum NodeSegmentInteractionMovingState {
    none = 1,
    before,
    active,
    after
}

export interface NodeSegmentInteractionRules {
    moving: NodeSegmentInteractionMovingState; // adjusting a link position or reassigning by dragging it to other node
    messaging: NodeSegmentInteractionMessagingState; // sending message to remote consumer
}

export interface NodeSegmentState {
    interaction: NodeSegmentInteractionRules;
}

export interface NodeSegmentCoordinateSocketOrganizer {
    socket: SocketModel;
    collection: Set<SocketModel>; // necessary for determining correct layout order for above listed socket
}

export interface NodeSegmentCoordinate {
    x: number;
    y: number;
    card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>;
    gridItem: GridsterItemComponentInterface;
    organizer: NodeSegmentCoordinateSocketOrganizer;
}

export interface NodeSegmentConnectorGeometry {
    path: string; // current computed SVG path
}

export interface NodeSegmentConnector {
    id: string;
    start: NodeSegmentCoordinate;
    end: NodeSegmentCoordinate;
    state: NodeSegmentState;
    geometry: NodeSegmentConnectorGeometry;
    node: NodeModel; // producer node where segment "starts" from
}


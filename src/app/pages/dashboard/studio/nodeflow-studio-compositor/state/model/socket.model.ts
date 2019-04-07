import { NodeSegmentCoordinate } from "./compositor.interface";


// potential segment drag/reassign states
export enum SocketViewModelInteractionSelectingState {
    none = 0,
    focused // setting while selecting from a dropdown menu to highlight which socket might take some action upon
}

export interface SocketViewModelInteractionRules {
    selecting: SocketViewModelInteractionSelectingState;
}

export interface SocketViewModelState {
    interaction: SocketViewModelInteractionRules;
}

export interface SocketViewRenderedNotation {
    centerX: number;
    centerY: number;
    isCondensed: boolean;
}

// view-wide setting: determines the direction of the socket placement on the node element
export enum SocketLayoutOrientationType { horizontal = 1, vertical}

export enum SocketConnectorType { input = 1, output = 2 }

export class SocketViewModel {
    // constrained collection of the only permitted connector types
    static supportedConnectorTypes: Array<SocketConnectorType> = [SocketConnectorType.input, SocketConnectorType.output];

    nodeSegmentCoordinate: NodeSegmentCoordinate; // how the template uses a visual socket
    renderedNotation: SocketViewRenderedNotation = {} as any; // for linking drawn position to connector
    state: SocketViewModelState = {interaction: {selecting: SocketViewModelInteractionSelectingState.none}};

    constructor() {

    }

    // retain positioning coordinate for bridging other components
    onRendered(centerX: number, centerY: number, isCompactMode: boolean) {
        this.renderedNotation.centerX = centerX;
        this.renderedNotation.centerY = centerY;
        this.renderedNotation.isCondensed = isCompactMode;
    }
}

export class SocketModel {

    id: string; // unique within entire app
    type: SocketConnectorType; // direction
    topic: string; // binding attribute for the message to the recipient(s)
    enabled: boolean; // node has authority to shutdown a port for maintenance / security
    multicast: boolean; // single or multiple streams. Is multicast data delivered sequentially or in parallel?

    view: SocketViewModel = new SocketViewModel();
}






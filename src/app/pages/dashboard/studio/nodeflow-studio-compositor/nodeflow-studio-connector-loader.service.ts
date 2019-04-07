import { Injectable } from "@angular/core";
import {
    NodeSegmentConnector,
    NodeSegmentInteractionMessagingState,
    NodeSegmentInteractionMovingState,
    NodeSegmentInteractionRules,
    NodeSegmentState
} from "./state/model/compositor.interface";
import { NodeflowStudioConnectorGeometryService } from "./nodeflow-studio-connector-geometry.service";
import { SocketConnectorType, SocketModel } from "./state/model/socket.model";
import { NodeModel } from "./state/model/node.model";
import {
    DashboardAssemblyLayout,
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { GridsterItemComponentInterface } from "ngx-card-deck";
import { AssetNodeConfigurationCardMetadataSchema } from "../../dashboard-page/client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.interface";


interface CardConfigurationModelParameterMessageStateSchema {
    classifier: string;
    data: any; // user defined
}

interface CardConfigurationModelParameterMessageSchema {
    topic: string;
    form: { component: string };
    state: CardConfigurationModelParameterMessageStateSchema;
}

interface CardConfigurationModelParameterSocketSubscriberSchema {
    id: string;
    valid: boolean;
}

export interface CardConfigurationModelParameterSocketSchema {
    id: string;
    type: "output" | "input";
    multicast: boolean;
    topic: string;
    subscribers?: Array<CardConfigurationModelParameterSocketSubscriberSchema>; // producers only
}


export interface CardConfigurationModelParameterSchema {
    producer: {
        messages: Array<CardConfigurationModelParameterMessageSchema>; // may not produce messages
    } | null;
    link: {
        sockets: Array<CardConfigurationModelParameterSocketSchema>; // directional-aware ports for message delivery
    } | null;
}


/*
interface SocketCardRelationSchema {
    socket: CardConfigurationModelSocket;
    socketType: SocketConnectorType;
    card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>;
    message: CardConfigurationModelMessage;
}
*/


const resources = {
    parameterSpecification: {
        moduleType: "parameters",
        containerName: "modulesList"
    },
    socketTypeMetadataMap: {
        "input": 0,
        "output": 1
    }
};


// transforms serialized JSON metadata into a compatible data structure/relationships for runtime
@Injectable()
export class NodeflowStudioConnectorLoaderService {

    constructor(private geometryService: NodeflowStudioConnectorGeometryService) {
    }

    fetchModelParameter(cardResource: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>): CardConfigurationModelParameterSchema | undefined {

        const dals = (cardResource.resolver.injectorInstance as DashboardAssemblyLayout<any>).state();
        const metadataResource = dals.findConfigurationResourceByType(resources.parameterSpecification.containerName, resources.parameterSpecification.moduleType);

        if (metadataResource) {
            const metadataInjectorState: AssetNodeConfigurationCardMetadataSchema = metadataResource.resolver.injectorInstance.state() as any;
            return (metadataInjectorState.model as CardConfigurationModelParameterSchema) || undefined;
        }

        return;
    }

    filterCardSocketMetadataByType(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>, socketType: SocketConnectorType): boolean {
        const cardMetadataModel = this.fetchModelParameter(card);
        if (cardMetadataModel && cardMetadataModel.link) {
            const socketList = cardMetadataModel.link.sockets;
            if (Array.isArray(socketList)) {
                return socketList.filter((socket) => resources.socketTypeMetadataMap[socket.type] === socketType).length > 0;
            }
        }
        return false;
    }


    // for each gridster item, partial preparation - does not resolve linkage
    parseGridsterItemModel(gi: GridsterItemComponentInterface): CardConfigurationModelParameterSchema | undefined {
        // ResourceFacade
        return this.fetchModelParameter(this.geometryService.fetchCardMetadata(gi));
    }


    // connector link, view object
    generateConnectorRelationView(producer: NodeModel, producerSocket: SocketModel, consumer: NodeModel, consumerSocket: SocketModel): NodeSegmentConnector {

        const connectorMetadata: NodeSegmentConnector = this.mixinNodeSegmentConnectorGeometry({
            // id: `connector:${relation.id}`, // socket relation
            // output initiates connector's flow
            start: this.geometryService.generateItemConnectorCoordinate(producer, producerSocket),
            end: this.geometryService.generateItemConnectorCoordinate(consumer, consumerSocket),
            state: this.initializeNodeSegmentState() // user interaction state
        } as any);

        return connectorMetadata;
    }


    // prepare connector user interaction flow state
    private initializeNodeSegmentState(): NodeSegmentState {
        const interactionRules: NodeSegmentInteractionRules = {
            moving: NodeSegmentInteractionMovingState.none,
            messaging: NodeSegmentInteractionMessagingState.none
        };
        return {interaction: interactionRules};
    }

    // compute path upfront
    private mixinNodeSegmentConnectorGeometry(connector: NodeSegmentConnector): NodeSegmentConnector {
        connector.geometry = {} as any; // too early to fulfill the path since the sockets render first
        return connector;
    }


}

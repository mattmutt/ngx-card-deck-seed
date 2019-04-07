import { Injectable } from "@angular/core";
import { NodeflowConfigurationPreprocessor } from "../../../client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.class";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import { NodeflowStudioConnectorLoaderService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-connector-loader.service";
import { NodeflowStudioConnectorGeometryService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-connector-geometry.service";
import { DashboardConfigurationFacadeService } from "ngx-card-deck";
import { Observable, of, throwError } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { MessageConnectorsRouteManager } from "../../../../studio/nodeflow-studio-compositor/state/model/collection/message-connectors-route-manager.model";
import {
    ToolbarSerializedDocumentContent,
    ToolbarSerializedDocumentEntityPackagingType,
    ToolbarSerializedDocumentEntityReference
} from "./toolbar-serialize-model.model";
import {
    AssetNodeConfigurationCardMetadataSchema,
    AssetNodeConfigurationCardSchema,
    AssetNodeConfigurationSchema
} from "../../../client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.interface";
import { NodeflowAssetNodeComponent } from "../../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.component";
import {
    SocketConnectorType,
    SocketModel
} from "../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { SocketConnectorRelationStateType } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { NodeModel } from "../../../../studio/nodeflow-studio-compositor/state/model/node.model";


const resources = {
    documentType: {
        "json": "application/json"
    },

    template: {
        document: {

            file: {
                prefix: "nodeflow-project-",
                extension: "json"
            },

            card: {
                component: "card-asset-node",
                // convention for instantiating correct presentation layer template from `NodeflowAssetNodeComponent` plugin
                templates: [
                    {
                        "body": {
                            "organization": "nodeflow_sample",
                            "template": "nodePresentation"
                        }
                    }
                ]
            }
        }
    }

};

@Injectable()
export class ToolbarSerializeModelAgentService {

    private cardConfigurationPreprocessor: NodeflowConfigurationPreprocessor;

    constructor(private gridStateManager: NodeflowStudioGridStateManagerService,
                private configurationFacadeService: DashboardConfigurationFacadeService,
                private connectorGeometryService: NodeflowStudioConnectorGeometryService,
                private connectorLoaderService: NodeflowStudioConnectorLoaderService) {
        this.cardConfigurationPreprocessor = new NodeflowConfigurationPreprocessor();

    }

    serializeNodeflowProjectModel$(
        newDocumentIdentifier: string,
        nodeflowAssetPluginList: Array<NodeflowAssetNodeComponent<any, any, any, any>>,
        messageConnectorsDelegate: MessageConnectorsRouteManager, // inventory of routes and connector hierarchies
        outputPackagingFormatType: ToolbarSerializedDocumentEntityPackagingType,
    ): Observable<ToolbarSerializedDocumentEntityReference> {

        return this.generateSerializedContent$(newDocumentIdentifier, nodeflowAssetPluginList, messageConnectorsDelegate, outputPackagingFormatType).pipe(
            mergeMap((serializedContent) => this.generateDocumentWrapper$(newDocumentIdentifier, serializedContent, outputPackagingFormatType))
        );

        // return throwError(new Error("Could not remove item from message connector route relation collection"));
    }

    // raw serialized form of the snapshot
    private generateSerializedContent$(
        newDocumentIdentifier: string,
        nodeflowAssetPluginList: Array<NodeflowAssetNodeComponent<any, any, any, any>>, // UI representation relates to nodeModel
        messageConnectorsDelegate: MessageConnectorsRouteManager, // inventory of routes and connector hierarchies
        outputPackagingFormatType: ToolbarSerializedDocumentEntityPackagingType
    ): Observable<ToolbarSerializedDocumentContent> {

        switch (outputPackagingFormatType) {
            case ToolbarSerializedDocumentEntityPackagingType.nativeDashboardResourceJson:
                return throwError(new Error("Serializer not developed for native dashboard resource"));
            case ToolbarSerializedDocumentEntityPackagingType.nodeflowConfigurationSchemaJson:
                return this.transformAssetNodeSerializedContent$(newDocumentIdentifier, nodeflowAssetPluginList, messageConnectorsDelegate, outputPackagingFormatType);

            default:
                return throwError(new Error("Unknown serializer"));
        }

    }


    // contains the contents fo the doc
    private generateDocumentWrapper$(newDocumentIdentifier: string, materializedContent: ToolbarSerializedDocumentContent, formatType: ToolbarSerializedDocumentEntityPackagingType): Observable<ToolbarSerializedDocumentEntityReference> {
        const generatedDocument = new ToolbarSerializedDocumentEntityReference();
        generatedDocument.packagingFormatType = formatType;
        generatedDocument.documentId = newDocumentIdentifier;

        generatedDocument.filename =
            [resources.template.document.file.prefix +
            this.formatFilenameSafeToken(newDocumentIdentifier)] +
            "." + resources.template.document.file.extension;

        generatedDocument.createdDate = new Date();
        generatedDocument.document = materializedContent;

        return of(generatedDocument);
    }

    // Operating System "safe" opinionated rules
    private formatFilenameSafeToken(str: string): string {
        return str.trim().replace(/\s+/g, "_").replace(/[~"'`/\\.,;]+/g, "");

    }

    // a transformer that produces document compatible with `NodeflowConfigurationPreprocessor`
    private transformAssetNodeSerializedContent$(
        id: string, //document deck id for the dashboard schema
        nodeflowAssetPluginList: Array<NodeflowAssetNodeComponent<any, any, any, any>>, // UI representation relates to nodeModel
        messageConnectorsDelegate: MessageConnectorsRouteManager, // inventory of routes and connector hierarchies
        outputPackagingFormatType: ToolbarSerializedDocumentEntityPackagingType
    ): Observable<ToolbarSerializedDocumentContent> {
        const cards: Array<AssetNodeConfigurationCardSchema> = [];
        const configurationSchema: AssetNodeConfigurationSchema = {id, cards};
        const materializedContent = new ToolbarSerializedDocumentContent();
        materializedContent.documentType = resources.documentType.json;

        const dispatchedErrorList: Array<Observable<never>> = [];

        nodeflowAssetPluginList
        // verification
            .filter((verifyNodeflowInstance) => !!(verifyNodeflowInstance.viewModel && verifyNodeflowInstance.viewModel.nodeModel))
            .forEach((nodeflowPlugin) => {

                const nodeModel = nodeflowPlugin.viewModel.nodeModel;
                const gridItem = nodeModel.view.gridItem;
                const card: AssetNodeConfigurationCardSchema = {} as any;
                card.id = nodeModel.id;
                card.component = resources.template.document.card.component;
                card.templates = resources.template.document.card.templates; // presentation standards
                card.header = {
                    title: nodeflowPlugin.resourceToken.outlet.title
                };

                const icons = nodeflowPlugin.resourceToken.outlet.titleIconClasses;
                if (Array.isArray(icons) && icons.length) {
                    card.header.icon = icons[0];
                }

                card.layout = {
                    x: gridItem.item.x!,
                    y: gridItem.item.y!,
                    width: gridItem.item.cols!,
                    height: gridItem.item.rows!
                };


                const cardMetadataModel = {} as any;

                // producer messages role
                if (nodeModel.producer && nodeModel.producer.messageCollection.size) {

                    const messageList: Array<any> = [];

                    nodeModel.producer.messageCollection.forEach((messageModel) => {

                        const messageSchema = {
                            topic: messageModel.topic,
                            form: messageModel.form,
                            state: messageModel.state
                        };

                        messageList.push(messageSchema);
                    });

                    cardMetadataModel.producer = {messages: messageList};

                } else {
                    cardMetadataModel.producer = null;
                }


                // link sockets role
                if (nodeModel.link) {

                    const socketList: Array<any> = [];
                    // capture sockets grouped by each direction
                    nodeModel.link.managedCollections.forEach((directedSocketSet) => {

                        directedSocketSet.forEach((socketIterator) => {

                            const socketSchema: any = {};

                            socketSchema.id = socketIterator.id;
                            socketSchema.type = socketIterator.type === SocketConnectorType.input ? "input" : "output";
                            socketSchema.topic = socketIterator.topic;
                            socketSchema.enabled = socketIterator.enabled;
                            socketSchema.multicast = socketIterator.multicast;

                            if (socketIterator.type === SocketConnectorType.output && nodeModel.producer) {
                                // has consumers linked to this output socket
                                const subscriberList: Array<{ id: string, valid: boolean | null }> = [];

                                const producerMessage = nodeModel.producer.findMessageBySocket(socketIterator);

                                // prefer  message-keyed lookup. Should not fail over to `getRouteRelationListBySocket()`
                                // prove edge if theory is wrong
                                const routeRelationList = producerMessage
                                    ? messageConnectorsDelegate.getRouteRelationListByMessage(producerMessage)
                                    : messageConnectorsDelegate.getRouteRelationListBySocket(socketIterator);

                                routeRelationList.forEach((rr) => {

                                    rr.connectors.forEach((scr) => {

                                        // trinary state for link state
                                        const connectorValidState: boolean | null =
                                            (scr.state === SocketConnectorRelationStateType.unknown)
                                                ? null : scr.state === SocketConnectorRelationStateType.valid;

                                        // linkage to a consumer socket
                                        const consumerNodeModel = this.resolveNodeModelBySocket(scr.consumer, nodeflowAssetPluginList);
                                        if (consumerNodeModel) {
                                            subscriberList.push({
                                                id: consumerNodeModel.id,
                                                valid: connectorValidState
                                            });
                                        } else {
                                            dispatchedErrorList.push(throwError("missing consumer node " + scr.consumer.id));
                                        }

                                    });

                                });

                                socketSchema.subscribers = subscriberList;
                            }

                            socketList.push(socketSchema);
                        });

                    });

                    cardMetadataModel.link = {sockets: socketList};

                } else {

                    cardMetadataModel.link = null;
                }

                card.metadata = {
                    provider: {
                        business: nodeflowPlugin.cardMetadata.businessProvider
                    },
                    model: cardMetadataModel
                } as AssetNodeConfigurationCardMetadataSchema;

                cards.push(card);
            });

        materializedContent.content = JSON.stringify(configurationSchema);

        // relay known first error ( might be several)
        return dispatchedErrorList.length ? dispatchedErrorList[0] : of(materializedContent);
    }

    // did not want to have a dependency on the GridStateManager
    private resolveNodeModelBySocket(socketRef: SocketModel, nodeflowPluginCollection: Array<NodeflowAssetNodeComponent<any, any, any, any>>
    ): NodeModel | undefined {
        const pluginMatch = nodeflowPluginCollection.find((plugin) =>
            !!(plugin.viewModel.nodeModel.link && plugin.viewModel.nodeModel.link!.findSocketById(socketRef.id, socketRef.type)) || false);

        return pluginMatch ? pluginMatch.viewModel.nodeModel : undefined;
    }

}


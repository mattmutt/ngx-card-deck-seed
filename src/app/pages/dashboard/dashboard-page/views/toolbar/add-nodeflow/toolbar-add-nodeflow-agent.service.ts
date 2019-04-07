import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { filter, map, take, tap } from "rxjs/operators";
import {
    DashboardConfigurationFacadeService,
    DashboardConfigurationResourceCardSchema,
    GridContainerDashboardAssemblyLayout,
    ViewAssemblyTypeStateResourceLayoutItemSchema
} from "ngx-card-deck";
import { AssetNodeConfigurationCardSchema } from "../../../client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.interface";
import { NodeflowConfigurationPreprocessor } from "../../../client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.class";
import { GridContainerDashboardAssemblyLayoutState } from "ngx-card-deck";
import { DASHBOARD_ASSEMBLY_STRATEGY_RESOLVER_STATE_TYPE } from "ngx-card-deck";
import { GridContainerDashboardContainerComponent } from "ngx-card-deck";
import { GridContainerDashboardAssemblyMaterializedModel } from "ngx-card-deck";
import {
    NodeLinkModel,
    NodeModel,
    NodeProducerModel
} from "../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import {
    SocketConnectorType,
    SocketModel
} from "../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import {
    GridsterComponent,
    GridsterItemComponentInterface
} from "ngx-card-deck";
import { MessageModel } from "../../../../studio/nodeflow-studio-compositor/state/model/message.model";
import { NodeflowStudioConnectorLoaderService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-connector-loader.service";
import { NodeflowStudioConnectorGeometryService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-connector-geometry.service";
import { SocketConnectorRelationModel } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { NodeflowAssetNodeComponent } from "../../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.component";
import { NodeflowCompositorViewUpdatable } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio.interface";
import { DeliveryMessageChangeType } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/delivery-message.model";
import { SocketRelationFormModel } from "./toolbar-add-nodeflow.interface";
import { BusinessNodeflowCardProviderSchema } from "../../../client/organizers/nodeflow/lib/models/parsers/dashboard/provider/business-nodeflow-card-provider.interface";


// joins model and gridster UI item
interface MaterializedModelViewRelation {
    model: GridContainerDashboardAssemblyMaterializedModel<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>;
    item: GridsterItemComponentInterface;
}


const resources = {
    templateOrganizationKey: "nodeflow_sample",
    templateProjectionRef: "nodePresentation"
};


@Injectable()
export class ToolbarAddNodeflowAgentService {


    private cardConfigurationPreprocessor: NodeflowConfigurationPreprocessor;


    constructor(private gridStateManager: NodeflowStudioGridStateManagerService,
                private configurationFacadeService: DashboardConfigurationFacadeService,
                private connectorGeometryService: NodeflowStudioConnectorGeometryService,
                private connectorLoaderService: NodeflowStudioConnectorLoaderService) {
        this.cardConfigurationPreprocessor = new NodeflowConfigurationPreprocessor();

    }


    transformToNode(modelView: MaterializedModelViewRelation,
                    inputSocketRelationList: Array<SocketRelationFormModel>,
                    outputSocketRelationList: Array<SocketRelationFormModel>,
                    gridContainerAssemblyInstance: GridContainerDashboardContainerComponent): NodeModel {

        const nodeModel = new NodeModel();
        nodeModel.view.gridItem = modelView.item;

        // links of any kind
        if (inputSocketRelationList.length || outputSocketRelationList.length) {
            const linkModel = new NodeLinkModel();
            nodeModel.link = linkModel;

            // produces messages?
            if (outputSocketRelationList.length) {
                nodeModel.producer = new NodeProducerModel();

                // prepare socket references
                /*
                    for (const socketMsg of cardParameterModel.link.sockets) {
                        const socket = this.factorySocket(socketMsg, nodeModel, validator);
                        nodeModel.link.addSocket(socket);
                    }
                    */

                // produce
                this.addNodeModelOutputSocketList(nodeModel, outputSocketRelationList, gridContainerAssemblyInstance, linkModel);
            }

            // inputs to build as subscribes
            if (inputSocketRelationList.length) {
                this.addNodeModelInputSocketList(nodeModel, inputSocketRelationList, gridContainerAssemblyInstance, linkModel);
            }
        }

        this.gridStateManager.addNode(nodeModel);

        return nodeModel;
    }

    // ======================= Nodeflow Actions ===================

    addNodeflow$(
        newCardResourceId: string, newCardName: string,
        newX: number, newY: number,
        newWidth: number, newHeight: number,
        businessProvider: BusinessNodeflowCardProviderSchema,
        remoteConsumerSocketList: Array<SocketRelationFormModel>,
        remoteProducerSocketList: Array<SocketRelationFormModel>,
        nodeflowCompositorView: NodeflowCompositorViewUpdatable,
        gridContainerAssemblyInstance: GridContainerDashboardContainerComponent,
        updateViewTrigger: () => void,
        newGridItemCreation$: Observable<ViewAssemblyTypeStateResourceLayoutItemSchema>
    ): Observable<NodeModel> {


        // place new card onto deck, assembling node and connector dependencies
        return this.startCreationProcess$(newCardResourceId,
            newCardName, newX, newY, newWidth, newHeight, businessProvider, gridContainerAssemblyInstance,
            newGridItemCreation$
        )
        // notify that adding caused a layout change, cancels out any null/unselected socket requests by client
            .pipe(
                map((modelView) =>
                    this.transformToNode(modelView,
                        remoteConsumerSocketList,
                        remoteProducerSocketList,
                        gridContainerAssemblyInstance)
                ),

                // side effect to update canvas view
                tap((nodeModel) => {

                    this.assignNodeModelToCardAssemblyPlugin(nodeModel, nodeflowCompositorView, gridContainerAssemblyInstance);
                    // tick to prepare paths by forcing layout
                    // setTimeout(() => {

                    // notify invoking component UI for capturing new item addition
                    // this.addLayoutItem$.emit(nodeModel.view.gridItem.item as ViewAssemblyTypeStateResourceLayoutItemSchema);

                    updateViewTrigger();

                    //}, 0);

                }),
                take(1)
            );

    }

    // validation: derive useful warning message
    generateValidationErrors(nodeModel: NodeModel, remoteSocket: SocketModel, socketRelation: SocketRelationFormModel): Set<{ code: string, label: string }> {

        const errors = new Set<{ code: string, label: string }>();


        if (!remoteSocket.enabled) {
            errors.add({code: "socket_disabled", label: "deactivated"});
        }


        // business rule enforcement of unicast limit
        if (!this.gridStateManager.routes.validateSocketAddConnectorRule(remoteSocket)) {

            errors.add({
                code: "socket_unicast_linked",
                label: "unicast socket linked " + (remoteSocket.type === SocketConnectorType.input ? "from" : "to") + " " +
                    this.gridStateManager.routes.getSocketConnectorRelationListBySocket(remoteSocket)
                        .map((scr) => {
                            const opposingSocket = this.gridStateManager.findNodeBySocket(scr.getOppositeSocket(remoteSocket));
                            return opposingSocket ? opposingSocket.id : "missing socket of type: " + SocketConnectorType[scr.getOppositeSocketConnectorType(remoteSocket)];
                        }).join(" * ")

            });
        }

        // when linking the local producer socket to an existing remote input socket
        if (remoteSocket.type === SocketConnectorType.input) {

            // if message is assigned, its topic must match
            if (socketRelation.message) {
                if (socketRelation.message.topic !== remoteSocket.topic) {
                    errors.add({
                        code: "message_topic_incompatible",
                        label: "Message topic is incompatible"
                    });
                }
            }

        }

        if (remoteSocket.type === SocketConnectorType.output) {
            if (!(nodeModel.producer && nodeModel.producer.findMessageBySocket(remoteSocket))) {
                errors.add({code: "message_not_created", label: "producer MessageModel missing"});
            }


        }

        return errors;
    }


    // set node model directly on linked card plugin
    private assignNodeModelToCardAssemblyPlugin(node: NodeModel, compositorView: NodeflowCompositorViewUpdatable, gridContainerAssemblyInstance: GridContainerDashboardContainerComponent): boolean {
        const messageConnectivityMgr = this.gridStateManager.routes;
        // presumed to be AssetNode
        const cardPlugin = gridContainerAssemblyInstance.cardAssemblyPluginList.find((plugin) => plugin.resourceToken.card.resourceId === node.view.gridItem.item.resourceId) as NodeflowAssetNodeComponent<any, any, any, any>;
        if (!cardPlugin) {
            return false;
        }
        // injects unified relevant node mode, sockets and connectors. Establishes view model context vital for triggering UI updates
        cardPlugin.attachViewModel({
            compositor: compositorView,
            nodeModel: node,
            messageConnectivityDelegate: messageConnectivityMgr,
            // change detecting streams
            onNodeCollectionChange$: this.gridStateManager.nodeCollectionChange$,
            // stream diverted for the node
            onNodeConsumerRelationsChange$: messageConnectivityMgr.streamMessageConnectorsRouteRelationCollectionChangeByNode$(node, SocketConnectorType.input),
            onNodeProducerRelationsChange$: messageConnectivityMgr.streamMessageConnectorsRouteRelationCollectionChangeByNode$(node, SocketConnectorType.output),

            // monitor socket changes
            onNodeConsumerSocketConnectorRelationModelChange$: messageConnectivityMgr.streamSocketConnectorRelationModelChangeByNode$(node, SocketConnectorType.input),
            onNodeProducerSocketConnectorRelationModelChange$: messageConnectivityMgr.streamSocketConnectorRelationModelChangeByNode$(node, SocketConnectorType.output)
        });

        return true;
    }


    private startCreationProcess$(cardResourceId: string, cardName: string,
                                  newX: number, newY: number,
                                  newWidth: number, newHeight: number,
                                  businessProvider: BusinessNodeflowCardProviderSchema,
                                  gridContainerAssemblyInstance: GridContainerDashboardContainerComponent,
                                  newGridItemCreation$: Observable<ViewAssemblyTypeStateResourceLayoutItemSchema>
    ): Observable<MaterializedModelViewRelation> {

        const modelView$ = new Subject<MaterializedModelViewRelation>();
        const conformingDeck = this.cardConfigurationPreprocessor.transform({
            "id": "syntheticDeck", // private scoped
            "cards": [this.generateCardResource(cardResourceId, cardName, newX, newY, newWidth, newHeight, businessProvider)]
        });

        this.configurationFacadeService.creatingConfiguration(conformingDeck).subscribe((postProcess) => {

            const newCardResourceFacade = postProcess.findConfigurationResourceByResourceId("cardsList", cardResourceId);

            if (newCardResourceFacade) {

                const dashboardViewStateResource = newCardResourceFacade.configurationFacade.findConfigurationResourceByType("viewsList", DASHBOARD_ASSEMBLY_STRATEGY_RESOLVER_STATE_TYPE);

                if (dashboardViewStateResource) {

                    const gcdals: GridContainerDashboardAssemblyLayoutState = (dashboardViewStateResource.resolver.injectorInstance as GridContainerDashboardAssemblyLayout<any>).state();
                    const cardMaterializedModel = gcdals.materializedModelList[0];

                    if (cardMaterializedModel) {
                        gridContainerAssemblyInstance.assemblyState.addModel(cardMaterializedModel);
                        gridContainerAssemblyInstance.gridWidget.optionsChanged(); // grid render new layout

                        // grid item factory phase within Gridster, pull in the initialized item
                        // short-lived and completes
                        newGridItemCreation$.pipe(filter((a) => a.resourceId === cardResourceId), take(1))
                            .subscribe((createdLayoutItem) => {

                                const gi = gridContainerAssemblyInstance.findGridItemByResourceId(cardResourceId);

                                if (gi) {
                                    // done, consideration: append new card to original `cardsList`
                                    gridContainerAssemblyInstance.managingDashboardComponent.dashboardConfigurationFacade.resources.cardsList.push(newCardResourceFacade);
                                    modelView$.next({model: cardMaterializedModel, item: gi});
                                } else {
                                    console.error("error finding new item on grid for", cardResourceId);
                                }

                            });


                    } else {
                        console.error("missing expected first model in synthesized dashboard assembly layout state", gcdals);
                    }

                } else {
                    console.error("unable to find dashboard view state properties", newCardResourceFacade.configurationFacade);
                }

            }

        });

        return modelView$;
    }


    // sets node producer message models and makes news relations to other referenced subscribers
    // some mocked up naming conventions placed here to make things work
    private addNodeModelOutputSocketList(nodeModel: NodeModel, outputSocketRelationList: Array<SocketRelationFormModel>, gridContainerAssemblyInstance: GridContainerDashboardContainerComponent, accumulator: NodeLinkModel) {


        // message bound on producer
        outputSocketRelationList.forEach((socketRelationFormModel) => {

            const selectedRemoteConsumerSocket = socketRelationFormModel.socket;
            if (selectedRemoteConsumerSocket) {

                if (socketRelationFormModel.isSocketLinked) {

                    const receivingNodeModel = this.gridStateManager.findNodeBySocket(selectedRemoteConsumerSocket);
                    // stubs, as there is insufficient metadata collected in the add node demo
                    if (receivingNodeModel) {

                        if (socketRelationFormModel.message) {
                            const message = new MessageModel();

                            message.topic = socketRelationFormModel.message.topic;
                            message.form = socketRelationFormModel.message.form;
                            message.state = this.cloneStructuredMetadata(socketRelationFormModel.message.state);

                            nodeModel.producer!.addMessage(message);

                            // creates a new socket along with relation to known consumer
                            const localProducerSocket = this.factoryNodeModelProducerSocket(nodeModel, message, receivingNodeModel, selectedRemoteConsumerSocket, socketRelationFormModel, gridContainerAssemblyInstance);

                            if (localProducerSocket) {
                                accumulator.addSocket(localProducerSocket);
                            } else {
                                console.error("unable to produce socket by rule");
                            }

                        } else {
                            console.log("message is not linked.. not an error");
                        }

                    } else {
                        console.error("unable to establish other node holding socket", selectedRemoteConsumerSocket.id);
                    }

                } else {
                    console.log("no error. did not want to link socket, which means no message either");

                    if (selectedRemoteConsumerSocket) {
                        // creates a new socket along with relation to known consumer
                        const unlinkedSocket = this.factorySocket(nodeModel, nodeModel, selectedRemoteConsumerSocket, socketRelationFormModel);
                        accumulator.addSocket(unlinkedSocket);
                        // console.log("but still needs to create the socket without linking", unlinkedSocket);
                        // try to make message..
                        if (socketRelationFormModel.message) {

                        }
                    }

                }
            } else {
                console.error("no consumer socket selected in form", socketRelationFormModel);
            }

        });

    }

    // build a socket
    private factorySocket(producerNodeModel: NodeModel, remoteNodeModel: NodeModel, remoteSocket: SocketModel, socketRelationFormModel: SocketRelationFormModel): SocketModel {
        const createdSocket = new SocketModel();
        // presumed defaults for the demonstration only
        createdSocket.topic = remoteSocket.topic;
        createdSocket.enabled = remoteSocket.enabled;
        createdSocket.type = SocketConnectorType.output;
        createdSocket.multicast = socketRelationFormModel.isSocketMulticast;

        // what if both local and remote sockets are unicast, but remote already has an existing relation?
        // console.log("warn if remote socket is unicast, and already having a bound relation..");
        // should not unfairly disconnect some other node's connector

        createdSocket.id = [producerNodeModel.id, createdSocket.topic, Date.now()].join("-"); // example naming convention

        // relay same reference to socket view on node
        createdSocket.view.nodeSegmentCoordinate = this.connectorGeometryService.generateItemConnectorCoordinate(producerNodeModel, createdSocket);

        return createdSocket;
    }

    // factory method for establishing local socket that associates a ready made message to a remote socket, making that a subscriber
    private factoryNodeModelProducerSocket(producerNodeModel: NodeModel, message: MessageModel, remoteNodeModel: NodeModel, remoteSocket: SocketModel, socketRelationFormModel: SocketRelationFormModel, gridContainerAssemblyInstance: GridContainerDashboardContainerComponent): SocketModel | undefined {

        const socket = this.factorySocket(producerNodeModel, remoteNodeModel, remoteSocket, socketRelationFormModel);

        // ---------- establish new connector to existing socket on the producer node ---
        // producer socket will be referenced by message
        if (socketRelationFormModel.isSocketLinked) {
            message.socket = socket;
        }

        const routeRelation = this.gridStateManager.routes.factoryMessageConnectorsRouteRelation(message);

        // does remote socket have capacity to broadcast to this socket, enforcement of multicast

        // rule: prevent subscriber from inadvertently being assigned more than once
        if (!routeRelation.hasSocketConnectorRelationByResourceId(socket.id, SocketConnectorType.input)) {

            const connectorRelation = new SocketConnectorRelationModel();
            connectorRelation.producer = socket;
            connectorRelation.consumer = remoteSocket;

            // ------- validation
            // rule: unicast inputs can accept only single piece of data delivered. Do not allow multiple bindings on port
            const consumerExisting = this.gridStateManager.routes.getRouteRelationListByMessage(message);

            if (!this.gridStateManager.routes.validateSocketAddConnectorRule(remoteSocket)) {
                const existingProducerList = consumerExisting.map((item) => Array.from(item.connectors).map((connector) => connector.producer.id));
                console.error("multiple bindings forbidden on add operation. relations would have to be relinquished");
                console.error("subscribing socket marked as", "multicast:", socket.multicast, "having relations of:", consumerExisting.length);

            } else {
                // success branch of validation

                if (socketRelationFormModel.isSocketLinked) {
                    connectorRelation.state = socketRelationFormModel.linkStateType;
                    connectorRelation.view.nodeSegmentConnector = this.connectorLoaderService.generateConnectorRelationView(producerNodeModel, socket, remoteNodeModel, remoteSocket);
                    connectorRelation.view.nodeSegmentConnector.id = connectorRelation.id!;


                    routeRelation.addConnector(connectorRelation);
                    // -------- /route relation

                    // establish new route between existing node and brand new node
                    this.gridStateManager.routes.addRouteRelation(routeRelation);
                }

                // automatically synchronize initial message state? ( acts like patch, does not cause change events to emit )
                if (socketRelationFormModel.isMessageStateSynchronized) {
                    routeRelation.unicastMessageState$(routeRelation.message, this.cloneStructuredMetadata(message.state), DeliveryMessageChangeType.restore, connectorRelation);
                }

            }
            // ------- /validation


        } else {
            console.error("socket cannot be related more than once", socket.id, "to message", routeRelation);
        }


        // ---------- /establish new connector to existing socket on the producer node ---


        //const cardParameterModel = this.connectorLoaderService.parseGridsterItemModel(nodeModel.view.gridItem);
        return socket;
    }

    // associates input sockets, and prepares additional relations on an established producer
    private addNodeModelInputSocketList(nodeModel: NodeModel, inputSocketRelationList: Array<SocketRelationFormModel>, gridContainerAssemblyInstance: GridContainerDashboardContainerComponent, accumulator: NodeLinkModel) {

        // subscribes to another socket
        inputSocketRelationList.forEach(socketRelationFormModel => {

            const selectedRemoteSocket = socketRelationFormModel.socket;

            let createdLocalSocket: SocketModel | undefined;
            let remoteProducerMessageModel: MessageModel | undefined;

            // creating a local socket
            if (selectedRemoteSocket) {

                const remoteProducerNode = this.gridStateManager.findNodeBySocket(selectedRemoteSocket);

                if (remoteProducerNode) {

                    remoteProducerMessageModel = remoteProducerNode.producer && remoteProducerNode.producer.findMessageBySocket(selectedRemoteSocket);
                    if (remoteProducerMessageModel) {

                        // ----------- local node socket, to synchronize same properties -------------
                        createdLocalSocket = new SocketModel();
                        createdLocalSocket.type = SocketConnectorType.input; // consumer
                        createdLocalSocket.topic = selectedRemoteSocket.topic;
                        createdLocalSocket.enabled = selectedRemoteSocket.enabled;
                        createdLocalSocket.multicast = socketRelationFormModel.isSocketMulticast;

                        // if remote is a unicast socket having existing relation, it has no more capacity for this linking to this socket
                        if (!selectedRemoteSocket.multicast && this.gridStateManager.routes.getSocketConnectorRelationListBySocket(selectedRemoteSocket).length) {
                            console.log("should warn user about connecting from a remote producer unicast socket that is already at capacity");
                        }

                        createdLocalSocket.id = [nodeModel.id, createdLocalSocket.topic, Date.now()].join("-");

                        // relay same reference to socket view on node
                        createdLocalSocket.view.nodeSegmentCoordinate = this.connectorGeometryService.generateItemConnectorCoordinate(nodeModel, createdLocalSocket);
                        // ---------- /establish new connector to existing socket on the producer node ---


                        // ----------- /socket new -------------

                        accumulator.addSocket(createdLocalSocket);

                    } else {
                        console.error("unable to match the established message model", selectedRemoteSocket.topic, "on node", remoteProducerNode.id);
                    }

                } else {
                    console.error("missing remote producer node from the socket", selectedRemoteSocket.id);
                }
            } else {
                console.log("no remote socket reference was found", socketRelationFormModel);
            }

            // -------- if socket linking ----------
            // +++++++++++ message - socket association
            if (createdLocalSocket && selectedRemoteSocket && socketRelationFormModel.isSocketLinked) {

                if (remoteProducerMessageModel) {
                    // goal: reuse route relation
                    const routeRelation = this.gridStateManager.routes.provideMessageConnectorsRouteRelationModel(selectedRemoteSocket, remoteProducerMessageModel);
                    const remoteProducerNode = this.gridStateManager.findNodeBySocket(selectedRemoteSocket);

                    // prevent subscriber from inadvertently being assigned more than once
                    if (remoteProducerNode && !routeRelation.hasSocketConnectorRelationByResourceId(createdLocalSocket.id, SocketConnectorType.input)) {

                        // -------- route relation
                        // const consumerNodeModel = this.gridStateManager.findNodeById(subscriberId);

                        const connectorRelation = new SocketConnectorRelationModel();
                        connectorRelation.producer = selectedRemoteSocket;
                        connectorRelation.consumer = createdLocalSocket;

                        // ------- validation
                        // validation: unicast inputs can accept only single piece of data delivered. Do not allow multiple bindings on port
                        // const consumerRouteRelationList = this.gridStateManager.routes.getRouteRelationListByMessage(remoteProducerMessageModel);
                        // const remoteSocketConnectorList = this.gridStateManager.routes.getSocketConnectorRelationListBySocket(selectedRemoteSocket);

                        const canAdd = this.gridStateManager.routes.validateSocketAddConnectorRule(selectedRemoteSocket);

                        if (!canAdd) {
                            // const existingProducerList = consumerRouteRelationList.map((item) => Array.from(item.connectors).map((connector) => connector.producer.id));
                            // console.error("error check", existingProducerList, "for route relations", consumerRouteRelationList);
                            console.error("over capacity for remote producer socket", selectedRemoteSocket);
                            // unsure if the operation should continue or not inside the loop
                        } else {
                            // success branch
                        }
                        // ------- /validation


                        connectorRelation.state = socketRelationFormModel.linkStateType;
                        connectorRelation.view.nodeSegmentConnector = this.connectorLoaderService.generateConnectorRelationView(remoteProducerNode, selectedRemoteSocket, nodeModel, createdLocalSocket);
                        connectorRelation.view.nodeSegmentConnector.id = connectorRelation.id!;


                        routeRelation.addConnector(connectorRelation);

                        // automatically synchronize initial message state
                        if (socketRelationFormModel.isMessageStateSynchronized) {
                            routeRelation.unicastMessageState$(remoteProducerMessageModel, remoteProducerMessageModel.state, DeliveryMessageChangeType.initialize, connectorRelation);
                        }

                        // -------- /route relation

                        // establish new route between existing node and brand new node
                        this.gridStateManager.routes.addRouteRelation(routeRelation);


                    } else {
                        console.error("socket cannot be related more than once", createdLocalSocket.id, "to message", routeRelation);
                    }
                } else {
                    console.log("socket and message linking disabled. no associations made");
                }


                // /end is socket linked
            }

        });

    }

    // acts as a serializer and possible mechanism for time machine
    private cloneStructuredMetadata(d: any): any {
        let dd: any;
        try {
            dd = JSON.parse(JSON.stringify(d)); // given clone, consume it
        } catch (e) {
            console.error("JSON error extracting data", e);
            dd = {};
        }
        return dd;
    }

    // minimal metadata structure for conforming to structural definition of card
    // Note: this is a blueprint example only
    private generateCardResource(resourceId: string, cardTitle: string, x: number, y: number, width: number, height: number, businessProvider: BusinessNodeflowCardProviderSchema): AssetNodeConfigurationCardSchema {


        // generate metadata
        const newCardResource = {
            "id": resourceId,
            "component": "card-asset-node",
            "header": {"title": cardTitle},
            "layout": {
                "x": x, "y": y,
                "width": width, "height": height
            },
            "metadata": {

                "provider": {
                    "business": businessProvider
                },
                "model": {
                    "producer": {
                        "messages": [
                            /*
                            {
                                "topic": "customer",
                                "form": {
                                    "component": "customerForm"
                                },
                                "state": {
                                    "classifier": "customerMessage",
                                    "data": {
                                        "customerNumber": "Cust123",
                                        "customerCity": "Seattle"
                                    }
                                }
                            }
                            */

                        ]
                    }, "link": {"sockets": []}
                }
            },
            "templates": [
                {
                    "body": {
                        // convention for this sample
                        "organization": resources.templateOrganizationKey,
                        "template": resources.templateProjectionRef
                    }
                }
            ]
        };

        return newCardResource;

    }

}


import { DashboardConfigurationFacadeService } from "ngx-card-deck";
import { Injectable } from "@angular/core";
import { NodeflowConfigurationPreprocessor } from "../../../client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.class";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import { NodeflowStudioConnectorLoaderService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-connector-loader.service";
import { NodeflowStudioConnectorGeometryService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-connector-geometry.service";
import { NodeModel } from "../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import {
    SocketConnectorType,
    SocketModel
} from "../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import {
    SocketConnectorRelationModel,
    SocketConnectorRelationStateType
} from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { GridContainerDashboardContainerComponent } from "ngx-card-deck";
import { Observable, of, throwError } from "rxjs";
import { map, mergeMap, tap } from "rxjs/operators";
import { MessageConnectorsRouteRelationModel } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import {
    MessageModel,
    MessageModelState
} from "../../../../studio/nodeflow-studio-compositor/state/model/message.model";
import { NodeflowCompositorViewUpdatable } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio.interface";
import { DeliveryMessageChangeType } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/delivery-message.model";


const resources = {};

@Injectable()
export class ToolbarAddSocketConnectorRelationAgentService {

    private cardConfigurationPreprocessor: NodeflowConfigurationPreprocessor;

    constructor(private gridStateManager: NodeflowStudioGridStateManagerService,
                private configurationFacadeService: DashboardConfigurationFacadeService,
                private connectorGeometryService: NodeflowStudioConnectorGeometryService,
                private connectorLoaderService: NodeflowStudioConnectorLoaderService) {
        this.cardConfigurationPreprocessor = new NodeflowConfigurationPreprocessor();

    }

    // validation rule: prevent circular node referencing between a pair of socket
    isNodeCircularReferenceConnectorRule: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
        const [socketA, socketB] = ["producerSocket", "consumerSocket"].map((f) => form.get(f)!.value);

        if (this.gridStateManager.isInitialized$.getValue() && socketA && socketB) {
            const [a, b] = [socketA, socketB].map((socket) => this.gridStateManager.findNodeBySocket(socket));
            const valid = ((a && b) && (a !== b));
            return valid ? null : {"circular_reference_connector": {label: "Circular-referenced node"}};

        } else {
            return null;
        }

    };

    addSocketConnectorRelation$(
        producerSocket: SocketModel,
        socketSocket: SocketModel,
        linkStateType: SocketConnectorRelationStateType,
        isProducerMessageStateCloned: boolean,
        nodeflowCompositorView: NodeflowCompositorViewUpdatable,
        gridContainerAssemblyInstance: GridContainerDashboardContainerComponent,
        updateViewTrigger: () => void
    ): Observable<SocketConnectorRelationModel> {

        // place new card onto deck, assembling node and connector dependencies
        return this.startCreationProcess$(producerSocket, socketSocket, linkStateType, isProducerMessageStateCloned, gridContainerAssemblyInstance).pipe(
            // notify that adding caused a layout change, cancels out any null/unselected socket requests by client

            // side effect to update canvas view
            tap((socketConnectorRelation) => {
                updateViewTrigger();
            })
        );

    }

    // validation: derive useful warning message
    generateValidationErrors(nodeModel: NodeModel, socket: SocketModel, referenceProducerSocket: SocketModel | null): Set<{ code: string, label: string }> {

        const errors = new Set<{ code: string, label: string }>();

        if (!socket.enabled) {
            errors.add({code: "socket_disabled", label: "deactivated"});
        }

        // prevent duplicate socket->socket relations if existing
        if (referenceProducerSocket && socket.type === SocketConnectorType.input) {

            const existingSocketRelation = this.gridStateManager.routes.findSocketConnectorRelationBySocketPair(referenceProducerSocket, socket);
            if (existingSocketRelation) {
                errors.add({
                    code: "socket_connector_relation_duplicate",
                    label: "connector relation exists"
                });

                // showing just this serious error
            }

        }


        // unicast limit -- see if another node is delivering messages to the unicast socket. Enforce limit
        if (!socket.multicast) {

            const isConnectedSocketRelation = this.gridStateManager.routes.isSocketConnected(socket);
            if (isConnectedSocketRelation) {

                errors.add({
                    code: "socket_unicast_linked",
                    label: "unicast socket linked " + (socket.type === SocketConnectorType.input ? "from" : "to") + " " +
                    this.gridStateManager.routes.getSocketConnectorRelationListBySocket(socket)
                        .map((scr) => {
                            const opposingSocket = this.gridStateManager.findNodeBySocket(scr.getOppositeSocket(socket));
                            return opposingSocket ? opposingSocket.id : "missing socket of type: " + SocketConnectorType[scr.getOppositeSocketConnectorType(socket)];
                        }).join(" * ")
                });
            }
        }

        if (socket.type === SocketConnectorType.output) {
            if (!(nodeModel.producer && nodeModel.producer.findMessageBySocket(socket))) {
                errors.add({code: "message_not_created", label: "producer MessageModel missing"});
            }
        }

        return errors;
    }


    private startCreationProcess$(producerSocket: SocketModel, consumerSocket: SocketModel,
                                  linkStateType: SocketConnectorRelationStateType, isProducerMessageStateCloned: boolean,
                                  gridContainerAssemblyInstance: GridContainerDashboardContainerComponent): Observable<SocketConnectorRelationModel> {
        const messageNodeModel = this.gridStateManager.findNodeBySocket(producerSocket);

        if (messageNodeModel) {

            if (messageNodeModel.producer) {

                const boundMessage = messageNodeModel.producer.findMessageBySocket(producerSocket);
                if (boundMessage) {

                    // ------------------
                    const routeRelation = this.factoryMessageConnectorsRouteRelation(producerSocket, boundMessage); // new or reuse existing relation
                    const newSocketConnectorRelation = this.factorySocketConnectionRelation(producerSocket, consumerSocket, boundMessage, linkStateType);

                    if (producerSocket.topic !== consumerSocket.topic) {
                        return throwError(new Error("incompatible socket topic pairing"));
                    }

                    if (newSocketConnectorRelation) {

                        // prior to adding the connector, make a copy of the latest message state
                        // how to selectively replay the state for just this socketConnectorRelation model?
                        return this.cloningMessageDataWorkflow$(routeRelation, newSocketConnectorRelation, isProducerMessageStateCloned).pipe(
                            mergeMap(() => {
                                if (routeRelation.addConnector(newSocketConnectorRelation)) {
                                    return of(newSocketConnectorRelation);
                                } else {
                                    return throwError(new Error("constraint failure: unable to add connector relation " + newSocketConnectorRelation.id));
                                }
                            })
                        );


                    } else {
                        return throwError(new Error("cannot make connector relation: " + producerSocket.id + " to " + consumerSocket.id));
                    }
                    // ------------------


                } else {
                    return throwError(new Error("cannot locate requisite message on node producer " + messageNodeModel!.id));
                }

            } else {
                return throwError(new Error("cannot locate requisite producer on node" + messageNodeModel!.id));
            }

        } else {
            return throwError(new Error("cannot locate requisite node by producer socket id" + producerSocket.id));
        }

    }

    // conditional workflow branch that executes a message data cloning operation
    private cloningMessageDataWorkflow$(routeRelation: MessageConnectorsRouteRelationModel, scr: SocketConnectorRelationModel, isWorkflowUsedFlag: boolean): Observable<MessageModel> {
        const msgModel = routeRelation.message;

        if (isWorkflowUsedFlag && msgModel && msgModel.state) {

            // just presume this part is asynch / long running
            if (msgModel.state.data !== undefined) {
                let producerMessageData: MessageModelState;

                // limiting work for cloning
                try {
                    producerMessageData = this.createMessageStateClone(msgModel);

                    // propagate a "restore" message state to just this newly joined connector
                    return routeRelation.unicastMessageState$(msgModel, producerMessageData, DeliveryMessageChangeType.restore, scr)
                        .pipe(map((flag) => msgModel));

                } catch (e) {
                    return throwError(new Error("cannot clone message data. Is it pure and serializable to JSON?"));
                }

            } else {
                return throwError(new Error("cannot recreate state if message or its data is missing"));
            }


        } else {
            // no-op pass
            return of(msgModel);
        }

    }

    // implementation details: message data cloning
    private createMessageStateClone(msgModel: MessageModel): MessageModelState {
        try {
            return {
                classifier: msgModel.state.classifier,
                data: JSON.parse(JSON.stringify(msgModel.state.data))
            };

        } catch (e) {
            throw (e);
        }
    }


    // yields the right route relation
    private factoryMessageConnectorsRouteRelation(producerSocket: SocketModel, boundMessage: MessageModel): MessageConnectorsRouteRelationModel {

        const rrList = this.gridStateManager.routes.getRouteRelationListByMessage(boundMessage);

        let rr: MessageConnectorsRouteRelationModel;
        // reuse pre-existing relation
        if (rrList.length) {

            if (rrList.length > 1) {
                console.error("don't want to pick from extra route relation matches", rrList.length);
            } else {
                // console.log("solid match", rrList[0]);
            }

            //  how to presume that only the first entry is to be taken?
            rr = rrList[0];
            // create a relation for the first time and yield
        } else {
            rr = this.gridStateManager.routes.factoryMessageConnectorsRouteRelation(boundMessage);
            if (this.gridStateManager.routes.addRouteRelation(rr)) {

            } else {
                console.error("unable to create or add route relation", rr.connectors);
            }
        }

        return rr;
    }


    // rules to establish connection between a pair of sockets
    private factorySocketConnectionRelation(startSocket: SocketModel, endSocket: SocketModel,
                                            boundMessage: MessageModel,
                                            linkState: SocketConnectorRelationStateType): SocketConnectorRelationModel | undefined {
        const connectorRelation = new SocketConnectorRelationModel();

        // linking relation
        connectorRelation.state = linkState;
        connectorRelation.producer = startSocket;
        connectorRelation.consumer = endSocket;


        /*
        // validation: unicast inputs can accept only single piece of data delivered. Do not allow multiple bindings on port
        const producerExisting = this.gridStateManager.routes.getRouteRelationListByMessage(boundMessage);
        if (!startSocket.multicast && producerExisting.length) {
            const existingProducerList = producerExisting.map((item) => Array.from(item.connectors).map((connector) => connector.producer.id));
            console.error("error cannot emit additional relations. limit is one", existingProducerList);
            return;
        }

        // validation: unicast inputs can accept only single piece of data delivered. Do not allow multiple bindings on port
        const consumerExisting = this.gridStateManager.routes.getRouteRelationListByMessage(boundMessage);
        if (!endSocket.multicast && consumerExisting.length) {
            const existingProducerList = consumerExisting.map((item) => Array.from(item.connectors).map((connector) => connector.consumer.id));
            console.error("error cannot oversubscribe relation. limit is one", existingProducerList);
            return;
        }
        */

        const [producerNodeModel, consumerNodeModel] = [startSocket, endSocket].map((s) => this.gridStateManager.findNodeBySocket(s)!);

        // producerNodeModel: NodeModel, consumerNodeModel: NodeModel,
        // establish view connector
        connectorRelation.view.nodeSegmentConnector = this.connectorLoaderService.generateConnectorRelationView(producerNodeModel, startSocket, consumerNodeModel, endSocket);
        connectorRelation.view.nodeSegmentConnector.id = connectorRelation.id!;

        return connectorRelation;
    }


}


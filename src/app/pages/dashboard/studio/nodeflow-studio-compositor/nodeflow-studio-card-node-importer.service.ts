import { Injectable } from "@angular/core";
import { NodeflowStudioGridStateManagerService } from "./nodeflow-studio-grid-state-manager.service";
import {
    SocketConnectorRelationModel,
    SocketConnectorRelationStateType
} from "./state/model/relation/socket-connector-relation.model";
import {
    CardConfigurationModelParameterSchema,
    CardConfigurationModelParameterSocketSchema,
    NodeflowStudioConnectorLoaderService
} from "./nodeflow-studio-connector-loader.service";
import { NodeLinkModel, NodeModel, NodeProducerModel } from "./state/model/node.model";
import { MessageModel } from "./state/model/message.model";
import { SocketConnectorType, SocketModel } from "./state/model/socket.model";
import { NodeflowStudioConnectorGeometryService } from "./nodeflow-studio-connector-geometry.service";
import {
    CardNodeValidationRuleType,
    CardSubjectsParseValidatorManager
} from "./state/model/collection/card-node-validator-subjects.model";
import { GridsterItemComponentInterface } from "ngx-card-deck";
import { ViewAssemblyTypeStateResourceLayoutItemSchema } from "ngx-card-deck";
import { DeliveryMessageChangeType } from "./state/model/relation/delivery-message.model";

@Injectable()
export class NodeflowStudioCardNodeImporterService {

    private state: NodeflowStudioGridStateManagerService;

    constructor(private connectorLoaderService: NodeflowStudioConnectorLoaderService,
                private connectorGeometryService: NodeflowStudioConnectorGeometryService
    ) {

    }

    setState(mgr: NodeflowStudioGridStateManagerService) {
        this.state = mgr;
    }


    // ------------ loading, ingest and hydration implementation of cards ---------

    nodeModelFactory(cardParameterModel: CardConfigurationModelParameterSchema, gridsterItem: GridsterItemComponentInterface): NodeModel {
        const nodeModel = new NodeModel();
        nodeModel.view.gridItem = gridsterItem;

        if (cardParameterModel.producer && Array.isArray(cardParameterModel.producer.messages)) {
            nodeModel.producer = new NodeProducerModel();

            cardParameterModel.producer.messages.forEach((msg) => {
                const message = new MessageModel();
                // Message required properties satisfies interface
                ["form", "state", "topic"].map((s) => message[s] = msg[s]);

                nodeModel.producer!.addMessage(message);
            });
        }

        return nodeModel;
    }

    parseCardModelStructure(validator: CardSubjectsParseValidatorManager) {
        // first pass
        this.state.nodeList.forEach((nodeModel) => {
            const cardParameterModel = this.connectorLoaderService.parseGridsterItemModel(nodeModel.view.gridItem);
            validator.configurationModelParameterMap.set((nodeModel.view.gridItem.item as ViewAssemblyTypeStateResourceLayoutItemSchema).resourceId, cardParameterModel!);

            const cnsv = validator.createCardNodeSubjectValidator(nodeModel);
            const nodeValidator = validator.findCardNodeSubjectValidatorById(nodeModel.id);

            // link assembly - cannot reference subscribers set
            if (cardParameterModel) {

                if (cardParameterModel.link && Array.isArray(cardParameterModel.link.sockets)) {
                    nodeModel.link = new NodeLinkModel();

                    // prepare socket references
                    for (const socketMsg of cardParameterModel.link.sockets) {
                        if (this.prevalidateSocket(socketMsg, nodeModel, validator)) {
                            const socket = this.factorySocket(socketMsg, nodeModel, validator);
                            nodeModel.link.addSocket(socket);
                        }
                    }

                }
            } else {
                cnsv.createValidationStatus(CardNodeValidationRuleType.general, false, `missing card model definition ${nodeModel.id}`);
            }
        });
    }

    // complex validation logic, accumulating syntax and business rule failures into validator
    parseCardModelLinkConnectors(validator: CardSubjectsParseValidatorManager) {
        // next pass, wire connectors in the link section
        this.state.nodeList.forEach((producerNodeModel) => {

            const cardParameterModel = validator.configurationModelParameterMap.get((producerNodeModel.view.gridItem.item as ViewAssemblyTypeStateResourceLayoutItemSchema).resourceId);
            const nodeValidator = validator.findCardNodeSubjectValidatorById(producerNodeModel.id);

            if (nodeValidator) {

                // link assembly relation
                if (cardParameterModel && cardParameterModel.link && Array.isArray(cardParameterModel.link.sockets)) {

                    // create socket bindings
                    for (const socketMsg of cardParameterModel.link.sockets) {

                        // restore link relation to subscribers
                        if (Array.isArray(socketMsg.subscribers) && producerNodeModel.producer) {

                            const bindingMessage = producerNodeModel.producer!.findMessageByTopic(socketMsg.topic);

                            if (bindingMessage) {
                                const routeRelation = this.state.routes.factoryMessageConnectorsRouteRelation(bindingMessage);

                                if (!socketMsg.multicast && socketMsg.subscribers.length > 1) {
                                    nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `producer socket set to unicast but discovered ${socketMsg.subscribers.length - 1} other subscribers`);
                                }

                                // extract  all subscribers when multicast, or only first when unicast
                                for (const sub of socketMsg.subscribers.filter((subMsg, subscriberPosition) => socketMsg.multicast ? true : subscriberPosition === 0)) {

                                    const subscriberId = sub["id"];

                                    if (subscriberId !== producerNodeModel.id) {

                                        //routeRelation.connectors
                                        const bindingProducerSocket = producerNodeModel.link!.findSocketById(socketMsg.id, SocketConnectorType.output);

                                        // prevent subscriber from inadvertently being assigned more than once
                                        if (!routeRelation.hasSocketConnectorRelationByResourceId(subscriberId, SocketConnectorType.input)) {

                                            if (bindingProducerSocket) {

                                                const consumerNodeModel = this.state.findNodeById(subscriberId);
                                                if (consumerNodeModel) {
                                                    const bindingConsumerSocket = consumerNodeModel.link!.findSocketByTopic(socketMsg.topic, SocketConnectorType.input);
                                                    if (bindingConsumerSocket) {

                                                        const connectorRelation = this.factorySocketConnectionRelation(bindingProducerSocket, bindingConsumerSocket, producerNodeModel, consumerNodeModel, sub["valid"], validator);
                                                        if (connectorRelation) {
                                                            routeRelation.addConnector(connectorRelation);
                                                            // pre-initialize delivery message state
                                                            routeRelation.unicastMessageState$(bindingMessage, bindingMessage.state, DeliveryMessageChangeType.initialize, connectorRelation );

                                                        } else {
                                                            nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `unable to establish connector relation: ${bindingProducerSocket.id} : ${bindingConsumerSocket.id}`);
                                                        }


                                                    } else {
                                                        nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `no matching consumer socket ${socketMsg.topic}`);
                                                    }

                                                } else {
                                                    nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `no matching consumer node ${subscriberId}`);
                                                }


                                            } else {
                                                nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `unable to relate socket definition ${socketMsg.id}`);
                                            }


                                        } else {
                                            nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `subscriber ${subscriberId} already bound on socket ${bindingProducerSocket && bindingProducerSocket.id}`);
                                        }


                                    } else {
                                        nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `self-referential link: circular reference error ${subscriberId}`);
                                    }

                                }

                                this.state.routes.addRouteRelation(routeRelation);
                            } else {
                                nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `no associated binding message in producer ${producerNodeModel.id} by topic ${socketMsg.topic}`);
                            }

                        } else {
                            // not every node produces streams
                        }
                    }

                } else {
                    // orphaned node ( no problem )
                    nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `missing card model link sockets`);

                }
            } else {
                // already caught during parseCardModelStructure
            }

        });
    }


    // rules to establish connection between a pair of sockets
    private factorySocketConnectionRelation(startSocket: SocketModel, endSocket: SocketModel,
                                            producerNodeModel: NodeModel, consumerNodeModel: NodeModel,
                                            validLinkState: boolean | null, validator: CardSubjectsParseValidatorManager): SocketConnectorRelationModel | undefined {
        const connectorRelation = new SocketConnectorRelationModel();

        // linking relation
        connectorRelation.producer = startSocket;
        connectorRelation.consumer = endSocket;

        // validation: unicast inputs can accept only single piece of data delivered. Do not allow multiple bindings on port
        // ok to use `getRouteRelationListBySocket(endSocket()` in this situation as state is being hydrated from a strict serialized format
        const consumerExistingRouteRelationList = this.state.routes.getRouteRelationListBySocket(endSocket);
        if (!endSocket.multicast && consumerExistingRouteRelationList.length) {
            const existingProducerList = consumerExistingRouteRelationList.map((item) => Array.from(item.connectors).map((connector) => connector.producer.id));

            const consumerNodeValidator = validator.findCardNodeSubjectValidatorById(consumerNodeModel.id);
            if (consumerNodeValidator) {
                consumerNodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `consumer socket already allocated to producer(s): ${existingProducerList}`);
            }
            return;
        }


        // trinary link status
        connectorRelation.state = validLinkState !== null
            ? validLinkState
                ? SocketConnectorRelationStateType.valid
                : SocketConnectorRelationStateType.invalid
            : SocketConnectorRelationStateType.unknown;

        // establish view connector
        connectorRelation.view.nodeSegmentConnector = this.connectorLoaderService.generateConnectorRelationView(producerNodeModel, startSocket, consumerNodeModel, endSocket);
        connectorRelation.view.nodeSegmentConnector.id = connectorRelation.id!;


        return connectorRelation;
    }

    // discover if a socket may have been added by socketId
    private prevalidateSocket(msg: CardConfigurationModelParameterSocketSchema, ownerNode: NodeModel, validator: CardSubjectsParseValidatorManager): boolean {
        const nodeValidator = validator.findCardNodeSubjectValidatorById(ownerNode.id);
        let flag = true;
        if (nodeValidator) {
            if (ownerNode.link) {

                if (!msg.id) {
                    // socket id key missing
                    flag = false;
                    nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, flag, `missing socket id key in declaration: ${msg.topic}`);

                } else if (ownerNode.link.findSocketById(msg.id)) {
                    // socket id primary key enforced
                    flag = false;
                    nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, flag, `duplicated socket id key detected on node: ${msg.id}`);

                } else if (ownerNode.link.findSocketByTopic(msg.topic)) {
                    // topic serves as an alternate key
                    flag = false;
                    nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, flag, `duplicated socket topic detected on node: ${msg.topic}`);
                }
            }
        }

        return flag;
    }

    // pass the blueprint message from JSON for a socket creation
    private factorySocket(msg: CardConfigurationModelParameterSocketSchema, ownerNode: NodeModel, validator: CardSubjectsParseValidatorManager): SocketModel {

        const socket = new SocketModel();
        ["id", "multicast", "topic", "enabled"].map((s) => socket[s] = msg[s]);
        socket.type = SocketConnectorType[msg.type];

        // relay same reference to socket view on node
        socket.view.nodeSegmentCoordinate = this.connectorGeometryService.generateItemConnectorCoordinate(ownerNode, socket);

        const nodeValidator = validator.findCardNodeSubjectValidatorById(ownerNode.id);

        // establish relation between message and its producer pipe
        const messageModel = socket.type === SocketConnectorType.output && ownerNode.producer && ownerNode.producer.findMessageByTopic(msg.topic);
        if (messageModel) {
            messageModel.socket = socket;
        } else {
            if (ownerNode.producer && msg.topic && socket.type === SocketConnectorType.output) {

                if (nodeValidator) {
                    nodeValidator.createValidationStatus(CardNodeValidationRuleType.general, false, `unable to establish relation from message to producer socket: ${msg.topic}`);
                }

            }
        }

        return socket;
    }


    /*
    // connector link, view object
    generateConnectorRelationView(producer: NodeModel, consumer: NodeModel): NodeSegmentConnector {

        const connectorMetadata: NodeSegmentConnector = this.mixinNodeSegmentConnectorGeometry({
            // id: `connector:${relation.id}`, // socket relation
            // output initiates connector's flow
            start: this.geometryService.generateItemConnectorCoordinate(producer.view.gridsterItem, SocketConnectorType.output),
            end: this.geometryService.generateItemConnectorCoordinate(consumer.view.gridsterItem, SocketConnectorType.input),
            state: this.initializeNodeSegmentState() // user interaction state
        } as any);

        return connectorMetadata;
    }


    // prepare connector user interaction flow state
    private initializeNodeSegmentState(): NodeSegmentState {
        const interactionRules: NodeSegmentInteractionRules = {moving: NodeSegmentInteractionMovingState.none};
        return {interaction: interactionRules};
    }

    // compute path upfront
    private mixinNodeSegmentConnectorGeometry(connector: NodeSegmentConnector): NodeSegmentConnector {
        connector.geometry = {path: this.geometryService.drawConnectorPathGeometry(connector)};
        return connector;
    }

    */


}

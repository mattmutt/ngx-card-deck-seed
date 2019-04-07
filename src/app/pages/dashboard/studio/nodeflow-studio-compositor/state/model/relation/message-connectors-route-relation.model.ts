import { SocketConnectorRelationModel, SocketConnectorRelationStateType } from "./socket-connector-relation.model";
import { MessageModel, MessageModelState } from "../message.model";
import { SocketConnectorType, SocketModel } from "../socket.model";
import { NodeModel } from "../node.model";
import { DeliveryMessageChangeType } from "./delivery-message.model";
import { forkJoin, Observable, of } from "rxjs";
import { map, take } from "rxjs/operators";

export class MessageConnectorsRouteRelationModel {

    connectors: Set<SocketConnectorRelationModel> = new Set();

    private readonly _uuid: string;

    // change detection callback
    constructor(
        public message: MessageModel, // is this a unique key throughout the model? or can multiple route relations reuse message?
        private onCollectionChange: () => Array<SocketConnectorRelationModel>, // notify collection of an addition or deletion
        private onItemChange: (scr: SocketConnectorRelationModel) => SocketConnectorRelationModel // notify when the internal state of a connector changes

    ) {
        this._uuid = this.generateUUID(message.topic);
    }

    get id(): string {
        return this._uuid;
    }

    // add to collection and notify if changed
    addConnector(connectorRelation: SocketConnectorRelationModel): boolean {
        // prevent connector being added if has equivalent endpoints as an existing one
        if (!this.hasExistingConnector(connectorRelation)) {
            this.connectors.add(connectorRelation);
            this.onCollectionChange();
            this.onItemChange(connectorRelation);
            return true;
        } else {
            return false;
        }
    }

    // remove from collection and notify if changed
    removeConnector(connectorRelation: SocketConnectorRelationModel): boolean {
        const deleted = this.connectors.delete(connectorRelation);
        if (deleted) {
            this.onCollectionChange();
            this.onItemChange(connectorRelation);
        }
        return deleted;
    }

    // prevent duplicate connectors with same endpoints being added
    hasExistingConnector(connectorRelation: SocketConnectorRelationModel, connectorState?: SocketConnectorRelationStateType): boolean {
        let b = false;
        this.connectors.forEach((connector) => {
            if (
                (connector.producer === connectorRelation.producer && connector.consumer === connectorRelation.consumer)
                &&
                // further limit by link state if desired
                (connectorState !== undefined ? connector.state === connectorState : true)
            ) {
                b = true;
            }
        });

        return b;
    }

    /**
     * does the connectors collection have an existing relation, by card resource id reference,
     * restricted further by role of the socketType and optional link state
     */
    hasSocketConnectorRelationByResourceId(subscriberId: string, socketType: SocketConnectorType, connectorState?: SocketConnectorRelationStateType): boolean {
        return (Array.from(this.connectors)
            .filter((scr) => (connectorState !== undefined ? scr.state === connectorState : true)) // by state
            .filter((scr) => {
                switch (socketType) {
                    // reconsider get a reference to the node model directly
                    case SocketConnectorType.output:
                        return subscriberId === scr.view.nodeSegmentConnector.start.card.resourceId;

                    case SocketConnectorType.input:
                        return subscriberId === scr.view.nodeSegmentConnector.end.card.resourceId;

                    default:
                        return false;
                }
            }).length > 0);
    }

    /**
     * reference node having hydrated collection of links can be cross referenced to see if holds
     * linked socket connector relations, possibly discriminated by state type of the relation
     */
    hasSocketConnectorRelationByNode(ownerNode: NodeModel, socketType: SocketConnectorType, connectorState?: SocketConnectorRelationStateType): boolean {
        return !!ownerNode.link && (Array.from(this.connectors)
            .filter((scr) => (connectorState !== undefined ? scr.state === connectorState : true)) // by state
            .filter((scr) => {
                switch (socketType) {
                    // reconsider get a reference to the node model directly
                    case SocketConnectorType.output:
                        return ownerNode.link!.hasSocket(scr.producer);

                    case SocketConnectorType.input:
                        return ownerNode.link!.hasSocket(scr.consumer);

                    // last hope, either kind of socket?
                    default:
                        return ownerNode.link!.hasSocket(scr.producer) || ownerNode.link!.hasSocket(scr.consumer);
                }
            }).length > 0);
    }

    /**
     * query for matching socket connectors provided a reference nodeModel and socket flow direction / link state
     */
    getSocketConnectorRelationListByNode(nodeModel: NodeModel, socketType?: SocketConnectorType, connectorState?: SocketConnectorRelationStateType): Array<SocketConnectorRelationModel> {
        return (Array.from(this.connectors)
            .filter((scr) => (connectorState !== undefined ? scr.state === connectorState : true)) // by state
            .filter((scr) => {
                switch (socketType) {
                    case SocketConnectorType.output:
                        const producerSocket = scr.producer;
                        return producerSocket === (nodeModel.link && nodeModel.link.findSocketById(producerSocket.id, SocketConnectorType.output));

                    case SocketConnectorType.input:
                        const consumerSocket = scr.consumer;
                        return consumerSocket === (nodeModel.link && nodeModel.link.findSocketById(consumerSocket.id, SocketConnectorType.input));

                    // generalization
                    case undefined:
                        const a = this.getSocketConnectorRelationListByNode(nodeModel, SocketConnectorType.input);
                        const b = this.getSocketConnectorRelationListByNode(nodeModel, SocketConnectorType.output);
                        return [...a, ...b];

                    default:
                        return false;
                }
            }));
    }

    /**
     * query for matching socket connectors provided a reference socket and optional specific socket flow direction / link state
     */
    getSocketConnectorRelationListBySocket(socketModel: SocketModel, socketType?: SocketConnectorType, connectorState?: SocketConnectorRelationStateType): Array<SocketConnectorRelationModel> {

        return (Array.from(this.connectors)
            .filter((scr) => (connectorState !== undefined ? scr.state === connectorState : true)) // by state
            .filter((scr) => {

                switch (socketType || socketModel.type) {
                    case SocketConnectorType.output:
                        const producerSocket = scr.producer;
                        return producerSocket === socketModel;

                    case SocketConnectorType.input:
                        const consumerSocket = scr.consumer;
                        return consumerSocket === socketModel;

                    // generalization
                    case undefined:
                        const a = this.getSocketConnectorRelationListBySocket(socketModel, SocketConnectorType.input);
                        const b = this.getSocketConnectorRelationListBySocket(socketModel, SocketConnectorType.output);
                        return [...a, ...b];

                    default:
                        return false;
                }
            }));
    }

    /**
     * filter socket connectors by restricting to a socket connector state of the link
     */
    getSocketConnectorRelationListByStateType(linkStateType: SocketConnectorRelationStateType): Array<SocketConnectorRelationModel> {
        return Array.from(this.connectors).filter((scr) => (scr.state === linkStateType));
    }

    // very useful for conditionally synchronizing some initial state of a newly added socket connector relation with an existing route relation group
    unicastMessageState$(messageRecord: MessageModel, nextMessageState: MessageModelState,
                         messageChangeType: DeliveryMessageChangeType,
                         recipientSocketConnector: SocketConnectorRelationModel): Observable<boolean> {
        return this.publishMessageStateToSocketConnectorRelation$(messageRecord, nextMessageState, messageChangeType, recipientSocketConnector);
    }

    // if and when all publishing events complete, the stream immediately completes with result flag
    // linkStateType if null or missing implies no splitting out from the route relation's connectors. Preferred behavior actually
    broadcastMessageState$(messageRecord: MessageModel, nextMessageState: MessageModelState,
                           messageChangeType: DeliveryMessageChangeType,
                           linkStateType?: SocketConnectorRelationStateType): Observable<boolean> {

        // which set of connectors will be delivered message state
        const targetedSocketConnectorRelationList = (linkStateType !== undefined && linkStateType !== null)
            ? this.getSocketConnectorRelationListByStateType(linkStateType)
            : Array.from(this.connectors);

        const tasks$ = targetedSocketConnectorRelationList.map((scr) => this.publishMessageStateToSocketConnectorRelation$(messageRecord, nextMessageState, messageChangeType, scr));

        // when all publishing tasks complete successfully. report any kind of failure as a complete failure for this task
        return forkJoin(tasks$).pipe(
            map((tasksStatus: Array<boolean>) => !tasksStatus.reduce((total, isSuccessful) => (total + (+!isSuccessful)), 0)),
            take(1)
        );
    }

    // broadcasts new message state to all socket connector subscribers
    // when linkStateType is supplied, only those connector relations matching the link type are passed data

    // privately and selectively passes the message data across a discrete, single socket connector channel

    // internals for machine generated token. Unsure if it needs to ever be serialized
    private generateUUID(property: string): string {
        return btoa(["route-relation", property, Date.now()].join("-"));

    }

    // each individual socket connector will publish and reflect new message state
    private publishMessageStateToSocketConnectorRelation$(messageRecord: MessageModel, nextMessageState: MessageModelState, messageChangeType: DeliveryMessageChangeType, transmitSocketConnector: SocketConnectorRelationModel): Observable<boolean> {
        this.synchronizeMessageModelState(messageRecord, nextMessageState, messageChangeType);
        transmitSocketConnector.onPublishMessageModelState(nextMessageState, messageChangeType);
        return of(true);
    }

    // adjusts the underlying state properties for the message model
    private synchronizeMessageModelState(messageRecord: MessageModel, nextMessageState: MessageModelState, messageChangeType: DeliveryMessageChangeType) {

        switch (messageChangeType) {
            case DeliveryMessageChangeType.delete:
                messageRecord.state.data = null; // represents the removed state
                break;

            default:
                // should a new state be pushed onto the record?
                messageRecord.state.classifier = nextMessageState.classifier; // synchronize underlying property for classifier
                messageRecord.state.data = nextMessageState.data; // synchronize underlying property for message data
                break;
        }
    }

}

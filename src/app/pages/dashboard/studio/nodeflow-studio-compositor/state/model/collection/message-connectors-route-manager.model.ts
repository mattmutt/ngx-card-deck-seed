import { BehaviorSubject, Observable, Subject } from "rxjs";
import { filter, map } from "rxjs/operators";
import { MessageConnectorsRouteRelationModel } from "../relation/message-connectors-route-relation.model";
import {
    SocketConnectorRelationModel,
    SocketConnectorRelationStateType
} from "../relation/socket-connector-relation.model";
import { SocketConnectorType, SocketModel } from "../socket.model";
import { MessageModel } from "../message.model";
import { NodeModel } from "../node.model";


const resources = {
    rules: {
        maxUnicastLimit: 1,
        maxMulticastLimit: Number.MAX_VALUE
    }
};

// singleton utility that acts as a directory and relation locator
export class MessageConnectorsRouteManager {

    // whenever a child is added/removed from a given route relation
    messageConnectorsRouteRelationCollectionChange$ = new BehaviorSubject<Array<MessageConnectorsRouteRelationModel>>([]);

    // route relations are computed prior to creating a node. retention upon subscription
    // useful for changes to bundled aggregation at the point of a multicast-accepting consumer socket
    socketConnectorRelationCollectionChange$ = new BehaviorSubject<Array<SocketConnectorRelationModel>>([]); // link changed with route relation

    // messageConnectorsRouteRelationCollectionChange$ = new Subject<Array<MessageConnectorsRouteRelationModel>>();

    // addition/removal of a single connector link
    socketConnectorRelationStateChange$ = new Subject<SocketConnectorRelationModel>(); // which connector item changed its state

    private _collection: Set<MessageConnectorsRouteRelationModel> = new Set();

    // manager-scoped mutation subject
    constructor() {
    }

    // complete list of active relations for all connectors between nodes
    get socketConnectorRelationList(): Array<SocketConnectorRelationModel> {

        return Array.from(this._collection)
            .map((routeRelation) => Array.from(routeRelation.connectors))
            .filter((collection) => collection.length)
            .reduce((acc, val) => acc.concat(val), []);
    }


    // change detection dispatcher for any connector link modification
    onSocketConnectorRelationItemChange = (scr: SocketConnectorRelationModel): SocketConnectorRelationModel => {
        this.socketConnectorRelationStateChange$.next(scr);
        return scr;
    };

    // change detection dispatcher for any connector link modification
    onSocketConnectorRelationCollectionChange = (): Array<SocketConnectorRelationModel> => {
        const list = this.socketConnectorRelationList;
        this.socketConnectorRelationCollectionChange$.next(list);
        // reflect change to the route relation collection which holds connector relations
        this.messageConnectorsRouteRelationCollectionChange$.next(Array.from(this._collection));
        return list;
    };

    // factory creation for all route relation instances
    factoryMessageConnectorsRouteRelation(boundMessage: MessageModel): MessageConnectorsRouteRelationModel {
        return new MessageConnectorsRouteRelationModel(boundMessage, this.onSocketConnectorRelationCollectionChange, this.onSocketConnectorRelationItemChange);
    }


    // create stream to watch on route relation collection change set
    // note: filtered by the node model and socket direction
    // changes noted as: adding/removing route relation OR adding/removing a connector inside of said route relation

    // pull in connector changes by selected node
    streamSocketConnectorRelationModelChangeByNode$(relatedNodeModel: NodeModel, socketType: SocketConnectorType): Observable<SocketConnectorRelationModel> {

        return this.socketConnectorRelationStateChange$.pipe(
            filter((scr, idx) => {
                switch (socketType) {

                    case SocketConnectorType.input:
                        return !!relatedNodeModel.link && relatedNodeModel.link.hasSocket(scr.consumer);

                    case SocketConnectorType.output:
                        return !!relatedNodeModel.link && relatedNodeModel.link.hasSocket(scr.producer);

                    default:
                        return false;
                }
            })
        );
        // yields the wrapping route relation of the connector

        /*
        const nodeOwnedRouteRelationStream$: Observable<Array<MessageConnectorsRouteRelationModel>> = this.socketConnectorRelationStateChange$
            .pipe(
                filter((scr, idx) => {
                    switch (socketType) {

                        case SocketConnectorType.input:
                            return !!relatedNodeModel.link && relatedNodeModel.link.hasSocket(scr.consumer);

                        case SocketConnectorType.output:
                            return !!relatedNodeModel.link && relatedNodeModel.link.hasSocket(scr.producer);

                        default:
                            return false;
                    }
                }),
                // yields the wrapping route relation of the connector
                map((scr) => this.findRouteRelationBySocketConnectorRelation(scr)),
                // undefined potential avoidance in subsequent chaining
                filter((rr) => !!(rr && rr.connectors))
            );

        return nodeOwnedRouteRelationStream$;
        */
    }


    /**
     * promotes reuse of an existing route relation model if located
     */
    streamMessageConnectorsRouteRelationCollectionChangeByNode$(relatedNodeModel: NodeModel, socketType: SocketConnectorType): Observable<Array<MessageConnectorsRouteRelationModel>> {

        return this.messageConnectorsRouteRelationCollectionChange$.pipe(
            map((allRouteRelationCollection) =>
                allRouteRelationCollection.filter((rr) =>
                    rr.hasSocketConnectorRelationByNode(relatedNodeModel, socketType))));
    }

    // otherwise instantiate a fresh, albeit partial, Route Relation Model with supplied message
    provideMessageConnectorsRouteRelationModel(remoteProducerSocket: SocketModel, messageModel: MessageModel): MessageConnectorsRouteRelationModel {
        let routeRelation: MessageConnectorsRouteRelationModel;
        const potentialProducerRouteRelationList = this.getRouteRelationListByMessage(messageModel);

        if (potentialProducerRouteRelationList.length) {

            if (potentialProducerRouteRelationList.length > 1) {
                console.error("inconsistent model state, with route relation yield size", potentialProducerRouteRelationList.length);
                // just pick first, but an error likely
            }

            // reuse, when available, route relation on producer edge
            routeRelation = potentialProducerRouteRelationList[0];
        } else {
            // ---------- establish new connector to existing socket on the producer node ---
            routeRelation = this.factoryMessageConnectorsRouteRelation(messageModel);
        }

        return routeRelation;
    }

    /**
     * find owning MessageConnectorsRouteRelationModel of child RouteRelation
     */
    findRouteRelationBySocketConnectorRelation(relation: SocketConnectorRelationModel): MessageConnectorsRouteRelationModel | undefined {
        return Array.from(this._collection).find((managingConnectors) => managingConnectors.connectors.has(relation));
    }

    /**
     * searches for a connector relation, given a pair of socket end points
     */
    findSocketConnectorRelationBySocketPair(producerReferenceSocket: SocketModel, consumerReferenceSocket: SocketModel, connectorState?: SocketConnectorRelationStateType): SocketConnectorRelationModel | undefined {
        const matches = this.getSocketConnectorRelationListBySocket(producerReferenceSocket)
            .filter((scr) =>
                scr.consumer === consumerReferenceSocket &&
                // can further limit by link state
                (connectorState !== undefined ? scr.state === connectorState : true)
            );
        return matches.length ? matches[0] : undefined;
    }

    /**
     * respects load capacity rule on the message route relation before performing an add
     */
    validateSocketAddConnectorRule(referenceSocket: SocketModel): boolean {
        let flag = true;

        // unicast check
        if (referenceSocket && !referenceSocket.multicast) {

            const localRouteRelationList = this.getRouteRelationListBySocket(referenceSocket);
            const localRouteRelationConnectorCount = localRouteRelationList.reduce((accumulator, rr) => (accumulator + rr.connectors.size), 0);

            if (localRouteRelationConnectorCount >= resources.rules.maxUnicastLimit) {
                flag = false;
                return flag;
            }

        }

        return flag;
    }

    /**
     * place route, notify change list for UI listeners
     */
    addRouteRelation(routeRelation: MessageConnectorsRouteRelationModel): boolean {
        // todo: detect and prevent similar endpoint pairs from becoming a duplicated entry in collection
        if (!this._collection.has(routeRelation)) {
            this._collection.add(routeRelation);
            this.messageConnectorsRouteRelationCollectionChange$.next(Array.from(this._collection));
            return true;
        } else {
            return false;
        }

    }

    /**
     * remove route entire collection of relations, notify change list for UI listeners
     */
    removeRouteRelation(routeRelation: MessageConnectorsRouteRelationModel): boolean {
        const relationRemoved = this._collection.delete(routeRelation);
        if (relationRemoved) {
            this.messageConnectorsRouteRelationCollectionChange$.next(Array.from(this._collection));
        }

        return relationRemoved;
    }

    /**
     *
     * Use only when it is absolutely guaranteed to be connected by the `SocketModel`
     * A Route Relation can exist without having established any `SocketConnectorRelation` items
     * -----------------------------
     * search for matching `MessageConnectorsRouteRelationModel` where there are
     * `SocketConnectorRelationModel` instances connecting to one side of a `SocketModel`
     * to be consistent, all socket connectors through a socket should be joined into one route relation
     * so could someone inadvertently create multiple `MessageConnectorsRouteRelationModel` objects through the same `MessageModel` instance ?
     * Does it break the logical constraints? Answer: unsure
     * could one create a testing/preview route relation using the same `MessageModel`? do constraints throw an error?
     * NOTE: this API is useless in the case whereby a socket has not yet linked up in the form of a
     * `SocketConnectorRelation` entity.
     *
     * === dealing with multiple route relations =====
     * On a consumer socket is setup in multicast receive mode, it has the opportunity to accept from multiple connectors,
     * which in turn are composed by various `MessageConnectorsRouteRelationModel` from various `NodeModel` objects.
     * Complex use case implies that different `MessageModel` payloads will be produced ( but of same `topic` )
     *
     */

    getRouteRelationListBySocket(socket: SocketModel, connectorState?: SocketConnectorRelationStateType): Array<MessageConnectorsRouteRelationModel> {

        return Array.from(this._collection).filter((managingConnectors) => !!Array.from(managingConnectors!.connectors)
            .find((connector) => socket.type === SocketConnectorType.output
                ? connector.producer === socket
                : connector.consumer === socket
                // can discriminate by link state
                && (connectorState !== undefined ? connector.state === connectorState : true)
            ));
    }

    /**
     * Preferred over `getRouteRelationListBySocket()` because a RouteRelation will always exist by message
     * However it may be unconnected to any `SocketConnectorRelation`, and hence not find the Route Relation
     * -----------------------------
     * yields all route relations composed by the entity key: `message`
     * unsure the edge case when to expect multiple hits for a message
     * technically possible to create many new `MessageConnectorsRouteRelationModel` that reference same message
     * custom business constraints would have to enforce constraint declarations
     */
    getRouteRelationListByMessage(message: MessageModel): Array<MessageConnectorsRouteRelationModel> {
        return Array.from(this._collection).filter((mcrrm) => mcrrm.message === message);
    }

    /**
     * for the socket, find matching socket connector relations, place into array
     */
    getSocketConnectorRelationListBySocket(socket: SocketModel, connectorState?: SocketConnectorRelationStateType): Array<SocketConnectorRelationModel> {

        return Array.from(this._collection)
            .map((routeRelation) => Array.from(routeRelation.getSocketConnectorRelationListBySocket(socket, socket.type, connectorState)))
            .filter((collection) => collection.length)
            .reduce((acc, val) => acc.concat(val), []);
    }

    // is the socket (either side of link) connected logically to at least 1 other on its opposing side
    isSocketConnected(socket: SocketModel, connectorState?: SocketConnectorRelationStateType): boolean {
        const relation = this.socketConnectorRelationList
            .find((socketConnectorRelation) =>
                (socketConnectorRelation.producer === socket || socketConnectorRelation.consumer === socket)
                // can discriminate by link state
                && (connectorState !== undefined ? socketConnectorRelation.state === connectorState : true)
                && socketConnectorRelation.isConnected
            );

        return !!relation;
    }


}

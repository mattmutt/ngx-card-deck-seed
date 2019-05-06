import { Injectable } from "@angular/core";
import { MessageConnectorsRouteManager } from "./state/model/collection/message-connectors-route-manager.model";
import { NodeflowStudioConnectorGeometryService } from "./nodeflow-studio-connector-geometry.service";
import { NodeflowStudioConnectorLoaderService } from "./nodeflow-studio-connector-loader.service";
import { NodeModel } from "./state/model/node.model";
import { NodeflowStudioShapeGeometryService } from "./nodeflow-studio-shape-geometry.service";
import { CardSubjectsParseValidatorManager } from "./state/model/collection/card-node-validator-subjects.model";
import { NodeflowStudioCardNodeImporterService } from "./nodeflow-studio-card-node-importer.service";
import { GridsterItemComponentInterface } from "ngx-card-deck";
import { ViewAssemblyTypeStateResourceLayoutItemSchema } from "ngx-card-deck";
import { SocketModel } from "./state/model/socket.model";
import { BehaviorSubject, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";


@Injectable()
export class NodeflowStudioGridStateManagerService {

    // internal state broadcasts
    isInitialized$ = new BehaviorSubject<boolean>(false);

    // collection observables for reactive client
    nodeCollectionChange$ = new Subject<Array<NodeModel>>().pipe(debounceTime(0)) as Subject<Array<NodeModel>>; // softens aggregation on component

    // initial values seeded
    nodeCollectionCache$ = new BehaviorSubject<Array<NodeModel>>(null as any);

    // ======== project state =======
    nodeList: Array<NodeModel>; // inventory of node and managed sockets
    routes: MessageConnectorsRouteManager; // inventory of routes and connector hierarchies


    constructor(
        private gridStoreService: NodeflowStudioCardNodeImporterService,
        private shapeGeometryService: NodeflowStudioShapeGeometryService,
        private connectorLoaderService: NodeflowStudioConnectorLoaderService,
        private connectorGeometryService: NodeflowStudioConnectorGeometryService
    ) {
        this.gridStoreService.setState(this);
        this.routes = new MessageConnectorsRouteManager(); // for reference binding
    }


    // synthesize a list of all relations realized between NodeModels and SocketModels ( regardless of subscribers)
    /*
    get nodeSocketRelation(): Array<NodeSocketRelationModel> {

        return this.nodeList
            .filter((n) => n.link) // safety
            .map((n) => Array.from(n.link!.typedSocketList).map((socket) => new NodeSocketRelationModel(n, socket)))
            .reduce((acc, val) => acc.concat(val), []);
    }
    */


    // alias to active flattened out list of connectors
    /*
    get nodeSegmentConnectorList(): Array<NodeSegmentConnector> {
        return Array.from(this.routes.collection)
            .map((routeRelation) => Array.from(routeRelation.connectors).map((relation) => relation.view.nodeSegmentConnector))
            .filter((collection) => collection.length)
            .reduce((acc, val) => acc.concat(val), []);
    }
    */

    findNodeById(id: string): NodeModel | undefined {
        return this.nodeList.find((node) => node.id === id);
    }

    // find node associated to the socket
    findNodeBySocket(socket: SocketModel): NodeModel | undefined {
        return this.nodeList.find((node) => !!node.link && !!node.link.findSocketById(socket.id, socket.type));
    }


    initializeStore() {
        // manually clear and reset, as ngOnInit isn't triggered subsequently
        this.nodeList = [];
        this.isInitialized$.next(true);
    }

    uninitializeStore() {
        // on navigation leave
        this.nodeList = undefined as any;
        delete this.routes;
        this.routes = new MessageConnectorsRouteManager(); // pre-initialize since dependencies must link
        this.isInitialized$.next(false);
    }


    // render accurately over time
    recalculateConnectorsView() {

        // link relations
        for (const connectorRelation of this.routes.socketConnectorRelationList) {
            this.connectorGeometryService.updateSegmentConnectorLayout(connectorRelation.view.nodeSegmentConnector);
        }

        // guarded: a lifecycle event can possibly leave the collection undefined
        if (this.nodeList) {
            for (const node of this.nodeList) {
                if (node.link) {
                    for (const typedManagedCollection of node.link.managedCollections) {
                        for (const socket of typedManagedCollection) {
                            this.shapeGeometryService.updateNodePosition(socket.view.nodeSegmentCoordinate);
                        }
                    }
                }
            }
        } else {
            // an error or buggy edge case when navigating ( returning to ) an existing grid view
            // todo: has subscriptions that haven't been removed thoroughly or at the right time. needs rework
            console.error("connector links recalculated with uninitialized nodeList");
        }

    }

    addNode(nodeModel: NodeModel): boolean {
        this.nodeList.push(nodeModel);
        this.emitCollectionChange();
        return true; // unless error
    }

    // try to remove the nodeModel
    removeNode(nodeModel: NodeModel): boolean {
        const gone = this.nodeList.splice(this.nodeList.indexOf(nodeModel), 1).length === 1;
        this.emitCollectionChange();
        return gone;
    }


    // as each view item is initialized from gridster
    importGridsterItem(gridsterItem: GridsterItemComponentInterface): void {
        const gridsterItemModel = this.connectorLoaderService.parseGridsterItemModel(gridsterItem);

        if (gridsterItemModel) {
            this.addNode(this.gridStoreService.nodeModelFactory(gridsterItemModel, gridsterItem));
        }

    }

    // signaled upon deck initialization: linking can safely occur for these items
    assembleLayoutConnectors(layoutItemList: Array<ViewAssemblyTypeStateResourceLayoutItemSchema>): CardSubjectsParseValidatorManager {
        const validatorAccumulatorManager = new CardSubjectsParseValidatorManager();

        if (layoutItemList.length) {
            this.gridStoreService.parseCardModelStructure(validatorAccumulatorManager);
            this.gridStoreService.parseCardModelLinkConnectors(validatorAccumulatorManager);
        }

        return validatorAccumulatorManager;
    }

    // push based notification
    private emitCollectionChange() {
        const collection = Array.from(this.nodeList);
        this.nodeCollectionChange$.next(collection);
        this.nodeCollectionCache$.next(collection);
    }
}

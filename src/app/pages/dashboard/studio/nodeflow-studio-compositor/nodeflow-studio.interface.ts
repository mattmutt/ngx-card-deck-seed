import { SocketConnectorRelationModel } from "./state/model/relation/socket-connector-relation.model";
import { NodeModel } from "./state/model/node.model";
import { MessageConnectorsRouteManager } from "./state/model/collection/message-connectors-route-manager.model";
import { Observable } from "rxjs";
import { NodeSegmentInteractionMessagingState } from "./state/model/compositor.interface";
import { MessageConnectorsRouteRelationModel } from "./state/model/relation/message-connectors-route-relation.model";
import { SocketModel } from "./state/model/socket.model";

// set of view model changing commands
// visual effects
export interface NodeflowCompositorViewUpdatable {

    updateViewTransition(): void; // forced relayout synchronize all transitions

    //private triggerLayoutRender() {
    // node asset component instructs a connector preview highlight
    onSocketConnectorRelationBeforeMovingStateChangeEvent(targetConnectorRelation: SocketConnectorRelationModel, showFlag: boolean): void;

    // animate the messaging delivery over connector
    onSocketConnectorRelationMessagingStateChangeEvent(targetConnectorRelation: SocketConnectorRelationModel, transitionState: NodeSegmentInteractionMessagingState): void;

    // preview socket
    onSocketViewSelectingStateChangeEvent(socket: SocketModel, show: boolean): void;
}


// fabric that combines the view, model and notable change detection streams
export interface NodeflowViewModelFacade {
    compositor: NodeflowCompositorViewUpdatable;
    nodeModel: NodeModel;
    messageConnectivityDelegate: MessageConnectorsRouteManager;
    // node creation
    onNodeCollectionChange$: Observable<Array<NodeModel>>;

    // === UI template observers for `*ngFor` loops: change detection - whenever any part (collection / contents ) of relationship changes ===
    // node's consumer side of the route relations (across all of its consumer sockets)
    onNodeConsumerRelationsChange$: Observable<Array<MessageConnectorsRouteRelationModel>>;
    // node's producer side of the route relations (across all of its producer sockets)
    onNodeProducerRelationsChange$: Observable<Array<MessageConnectorsRouteRelationModel>>;

    // catch relevant socket connector changes by node on both sides of the transaction
    onNodeProducerSocketConnectorRelationModelChange$: Observable<SocketConnectorRelationModel>;
    onNodeConsumerSocketConnectorRelationModelChange$: Observable<SocketConnectorRelationModel>;

}

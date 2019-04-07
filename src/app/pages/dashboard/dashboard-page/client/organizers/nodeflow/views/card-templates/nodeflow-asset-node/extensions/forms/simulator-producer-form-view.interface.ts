import { Observable } from "rxjs";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { MessageModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/message.model";
import { NodeModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";

export interface SimulatorProducerFormViewProviderMessageBroadcastHistory {
    publishedDate: Date; // when was message emitted to subscribers
    receivedDate: Date | null; // when was message finally received by all subscribers
    matchedRouteRelation: MessageConnectorsRouteRelationModel; // sent to these recipients
    messageRecord: MessageModel; // state of the message
    ownerNode: NodeModel; // origination
    deliveryStatus$: Observable<boolean>; // delivery triggered, waiting for status
}

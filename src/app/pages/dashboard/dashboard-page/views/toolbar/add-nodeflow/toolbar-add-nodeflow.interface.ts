import { SocketModel } from "../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { NodeflowProjectCardMessageModelSchema } from "../../../client/organizers/nodeflow/metadata/schema/nodeflow-card-project.interface";
import { SocketConnectorRelationStateType } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";

// common relation for each socket-message definition rule
export interface SocketRelationFormModel {
    socket: SocketModel | null;
    message: NodeflowProjectCardMessageModelSchema | null;
    isMessageStateSynchronized: boolean; // upon nodeflow creation, last known message state is synchronized on both ends
    isSocketLinked: boolean;
    isSocketMulticast: boolean;
    linkStateType: SocketConnectorRelationStateType; // new socket connector relation link assumes a state
}



import { NodeModel } from "../node.model";
import { SocketConnectorRelationModel } from "./socket-connector-relation.model";

// transient relation. UI may need to aggregate collection in a menu that organizes nodes to socket relations
export class NodeSocketConnectorRelationModelCollection {
    node: NodeModel;
    socketConnectorRelationCollection: Set<SocketConnectorRelationModel> = new Set();
}

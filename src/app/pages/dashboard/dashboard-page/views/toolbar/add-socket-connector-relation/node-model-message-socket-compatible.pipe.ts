import { Pipe, PipeTransform } from "@angular/core";
import {
    SocketConnectorType,
    SocketModel
} from "../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { NodeModel } from "../../../../studio/nodeflow-studio-compositor/state/model/node.model";

const emptiness: Array<NodeModel> = [];

// restricts possible nodes based upon a criteria to restrict to only showing nodes that are topic compatible
@Pipe({
    name: "nodeModelMessageSocketCompatible"
})
export class NodeModelMessageSocketCompatiblePipe implements PipeTransform {
    transform(items: Array<NodeModel>, socket: SocketModel, socketType: SocketConnectorType): Array<NodeModel> {
        if (items && socket) {
            const topic = socket.topic;
            if (topic) {

                return (items
                    .filter((d) => d.link && Array.from(d.link.getCollectionByType(socketType))
                        .filter((iteratorSocket) => iteratorSocket.topic === topic).length > 0));
            } else {

                console.error("no other socket compatibility test", socket);
                return emptiness; // no strategy possible to generalize compatibility
            }

        } else if (!socket && socketType === SocketConnectorType.input) {
            return emptiness; // no producer assigned yet

        } else {
            return items; // leave as is
        }

    }
}

import { Pipe, PipeTransform } from "@angular/core";
import { SocketModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { NodeLinkModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";

// organizes sockets consistently by a deterministic ordering business rule, separating disabled ports to the end
@Pipe({
    name: "orderedSocketList"
})
export class NodeflowSocketConnectorTypePipe implements PipeTransform {
    transform(items: Set<SocketModel>): Array<SocketModel> {
        // same ordering as the socket renderings
        return NodeLinkModel.sortCollection(items);
    }
}

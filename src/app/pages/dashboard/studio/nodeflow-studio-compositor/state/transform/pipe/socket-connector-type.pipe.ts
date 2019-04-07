import { Pipe, PipeTransform } from "@angular/core";
import { SocketModel } from "../../model/socket.model";
import { NodeLinkModel } from "../../model/node.model";

// organizes sockets consistently by a deterministic ordering business rule, separating disabled ports to the end
@Pipe({
    name: "orderedSocketList"
})
export class SocketConnectorTypePipe implements PipeTransform {
    transform(items: Set<SocketModel>): Array<SocketModel> {
        return NodeLinkModel.sortCollection(items);
    }
}

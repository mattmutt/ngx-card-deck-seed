import { Pipe, PipeTransform } from "@angular/core";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { SocketConnectorRelationModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { SocketModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/socket.model";

// filters the socket connectors by a socket
@Pipe({
    name: "extractSocketConnectorRelationListBySocket"
})
export class ExtractSocketConnectorRelationListBySocketPipe implements PipeTransform {

    transform(routeRelation: MessageConnectorsRouteRelationModel, filterBySocket: SocketModel): Array<SocketConnectorRelationModel> {
        return routeRelation.getSocketConnectorRelationListBySocket(filterBySocket);
    }

}

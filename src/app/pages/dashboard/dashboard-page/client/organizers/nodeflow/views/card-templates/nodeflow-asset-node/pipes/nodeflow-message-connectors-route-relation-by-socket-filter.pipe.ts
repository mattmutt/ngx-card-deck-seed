import { Pipe, PipeTransform } from "@angular/core";
import { SocketModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";

// show only route relations if the socket is participating within a linked connector
@Pipe({
    name: "routeRelationBySocketFilter",
    pure: true
})
export class NodeflowMessageConnectorsRouteRelationBySocketFilterPipe implements PipeTransform {

    transform(items: Array<MessageConnectorsRouteRelationModel>, filterBySocket: SocketModel): Array<MessageConnectorsRouteRelationModel> | undefined {
        return items.filter((rr) => rr.getSocketConnectorRelationListBySocket(filterBySocket).length > 0);
    }

    // keep in chase jumping back to async
    /*
    transform(stream: Observable<Array<MessageConnectorsRouteRelationModel>>, filterBySocket: SocketModel): Observable<Array<MessageConnectorsRouteRelationModel>> {
        // console.log("coming in", filterBySocket.id);
        return stream.pipe(map((messageConnectorsList) => messageConnectorsList.filter((rr) => rr.getSocketConnectorRelationListBySocket(filterBySocket).length > 0)));
    */

}

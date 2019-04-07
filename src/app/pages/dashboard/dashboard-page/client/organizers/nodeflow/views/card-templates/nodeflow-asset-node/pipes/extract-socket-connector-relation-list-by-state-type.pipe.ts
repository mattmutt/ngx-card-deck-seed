import { Pipe, PipeTransform } from "@angular/core";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import {
    SocketConnectorRelationModel,
    SocketConnectorRelationStateType
} from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";

// organizes sockets consistently by a deterministic ordering business rule, separating disabled ports to the end
@Pipe({
    name: "extractSocketConnectorRelationListByStateType"
})
export class ExtractSocketConnectorRelationListByStateTypePipe implements PipeTransform {

    transform(routeRelation: MessageConnectorsRouteRelationModel, linkStateType: SocketConnectorRelationStateType): Array<SocketConnectorRelationModel> {
        return routeRelation.getSocketConnectorRelationListByStateType(linkStateType);
    }

}

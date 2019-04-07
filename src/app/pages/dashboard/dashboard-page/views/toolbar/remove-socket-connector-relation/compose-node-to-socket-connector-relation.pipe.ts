import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { SocketConnectorRelationModel } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { NodeSocketConnectorRelationModelCollection } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/node-socket-connector-relation.model";
import { SocketConnectorType } from "../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";


// wraps node model to make relation to a set of socket connector relations, from the perspective of the reference socket type
@Injectable()
@Pipe({
    name: "composeNodeToSocketConnectorRelation"
})
export class ComposeNodeToSocketConnectorRelationPipe implements PipeTransform {

    constructor(private gridStateManager: NodeflowStudioGridStateManagerService) {
    }

    transform(items: Array<SocketConnectorRelationModel>, referenceSocketType: SocketConnectorType): Array<NodeSocketConnectorRelationModelCollection> | null {
        const list: Array<NodeSocketConnectorRelationModelCollection> = [];

        if (Array.isArray(items)) {
            items.forEach((scr) => {

                const nodePerspectiveReference = this.gridStateManager.findNodeBySocket(referenceSocketType === SocketConnectorType.input ? scr.consumer : scr.producer);
                if (nodePerspectiveReference) {
                    let matchNscrmc = list.find((nscrmc) => nscrmc.node === nodePerspectiveReference);
                    // should make new group in list
                    if (!matchNscrmc) {
                        list.push(matchNscrmc = new NodeSocketConnectorRelationModelCollection());
                        matchNscrmc.node = nodePerspectiveReference;
                    }
                    matchNscrmc.socketConnectorRelationCollection.add(scr);
                }

            });
            return list;
        } else {
            return null;
        }

    }

}

import { Pipe, PipeTransform } from "@angular/core";
import { SocketConnectorRelationModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { NodeModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import {
    SocketConnectorType,
    SocketModel
} from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

// organizes sockets consistently by a deterministic ordering business rule, separating disabled ports to the end
@Pipe({
    name: "nodeSocketListBySocketConnectorRelationAsync"
})
export class NodeSocketListBySocketConnectorRelationAsyncPipe implements PipeTransform {

    transform(stream$: Observable<SocketConnectorRelationModel>, ownerNode: NodeModel): Observable<Array<SocketModel>> {
        const socketType: SocketConnectorType = SocketConnectorType.input;

        return stream$.pipe(map((scr) => {

                if (ownerNode.link) {
                    switch (socketType) {

                        case SocketConnectorType.input:
                            return Array.from(ownerNode.link!.consumerSocketCollection);

                        // case SocketConnectorType.output:
                        //     return Array.from(ownerNode.link!.producerSocketCollection);

                        default:
                            return [];
                    }
                } else {
                    return [];
                }

            })
        );

    }

}

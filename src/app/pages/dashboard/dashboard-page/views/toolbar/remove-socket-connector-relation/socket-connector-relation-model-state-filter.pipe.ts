import { Pipe, PipeTransform } from "@angular/core";
import {
    SocketConnectorRelationModel,
    SocketConnectorRelationStateType
} from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";


// restricts possible connectors by connector link state
@Pipe({
    name: "socketConnectorRelationStateFilter"
})
export class SocketConnectorRelationModelStateFilterPipe implements PipeTransform {
    transform(items: Array<SocketConnectorRelationModel>, stateType: SocketConnectorRelationStateType | null): Array<SocketConnectorRelationModel> {
        if (Array.isArray(items)) {
            return items.filter((scr) => stateType !== null ? scr.state === stateType : true);

        } else {
            return items; // leave as is
        }

    }
}

import { Pipe, PipeTransform } from "@angular/core";
import { NodeflowProjectCardMessageModelSchema } from "../../../../client/organizers/nodeflow/metadata/schema/nodeflow-card-project.interface";
import { SocketModel } from "../../../../../studio/nodeflow-studio-compositor/state/model/socket.model";

// filters the message possibilities if a socket is selected - they have to match
@Pipe({
    name: "limitMessageBySocket"
})
export class LimitMessageBySocketPipe implements PipeTransform {
    transform(
        items: Array<NodeflowProjectCardMessageModelSchema>,
        constrainingSocket: SocketModel): Array<NodeflowProjectCardMessageModelSchema> {

        return constrainingSocket
            ? items.filter((cardMessageTemplate) => cardMessageTemplate.topic === constrainingSocket.topic)
            : items;
    }
}

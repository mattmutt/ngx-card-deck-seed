import { Pipe, PipeTransform } from "@angular/core";
import { MessageModel } from "../../../../../../../../studio/nodeflow-studio-compositor/state/model/message.model";

// pre-validation. Won't make a subform unless there are defined messages
@Pipe({
    name: "hasMessageModelState"
})
export class NodeflowMessageModelHasStatePipe implements PipeTransform {
    transform(items: Set<MessageModel>): Array<MessageModel> {
        return Array.from(items).filter((model) => model.state && Object.keys(model.state).length);
    }
}

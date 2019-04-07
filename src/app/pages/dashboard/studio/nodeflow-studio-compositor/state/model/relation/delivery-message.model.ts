import { MessageModelState } from "../message.model";

export enum DeliveryMessageChangeType {
    initialize = 1, // assign first time state ( which could be new or retrieved from serialized form)
    update, // all state changes are considered updates
    delete, // message model terminates and shuts down
    restore, // re-initialize state, used when a new connector joins and existing route relation group. Message cannot be called with initialize twice
}

// packaging for a message with delivery capability
export class DeliveryMessage {

    constructor(public payload: MessageModelState, public type: DeliveryMessageChangeType) {

    }
}


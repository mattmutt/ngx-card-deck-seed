import { Observable, BehaviorSubject } from "rxjs";
import { SocketConnectorType, SocketModel } from "../socket.model";
import { NodeSegmentConnector } from "../compositor.interface";
import { MessageModelState } from "../message.model";
import { DeliveryMessage, DeliveryMessageChangeType } from "./delivery-message.model";

export enum SocketConnectorRelationStateType {
    valid = 1, // link clear, ready to pass messages
    invalid, // link is not going to work ( for some reason, not specified here). Perhaps it needs to be user checked
    unknown // the server is busy calculating validation state
}

export class SocketConnectorViewModel {
    // physical drawing path
    nodeSegmentConnector: NodeSegmentConnector;
}

// establishes direction pipe connector between two sockets spread between two distinct NodeModels
export class SocketConnectorRelationModel {

    producer: SocketModel;
    consumer: SocketModel;

    // last known state
    state: SocketConnectorRelationStateType;

    // physical view
    view: SocketConnectorViewModel = new SocketConnectorViewModel();

    // behavior will relay only the last stored state not the whole series of snapshots over time
    private _publishMessageModelStateSubject$: BehaviorSubject<DeliveryMessage> = new BehaviorSubject<DeliveryMessage>(undefined as any);

    constructor() {

    }

    // synthesize link identifier when both side are present
    get id(): string | undefined {
        if (this.isConnected) {
            return [this.producer.id, this.consumer.id].join(":");
        }

        return;
    }

    get isConnected(): boolean {
        return !!(this.producer && this.consumer);
    }

    // capture any message received on the socket connector ( by consumer socket client code )
    get deliveryMessagePublished$(): Observable<DeliveryMessage> {
        return this._publishMessageModelStateSubject$;
    }

    // yields the currently linked sockets in the socket connector relation
    getLinkedSocketList(): Array<SocketModel> {
        const collection: Array<SocketModel> = [];
        if (this.consumer) {
            collection.push(this.consumer);
        }
        if (this.producer) {
            collection.push(this.producer);
        }

        return collection;
    }

    // determines the other socket in the relation, given a reference point
    getOppositeSocket(socket: SocketModel): SocketModel {
        return socket === this.producer ? this.consumer : this.producer;
    }


    // reflects message state to intended subscriber, does not necessarily store it

    // determines the other socket type in a relation, provided socket
    getOppositeSocketConnectorType(socket: SocketModel): SocketConnectorType {
        return socket.type === SocketConnectorType.output ? SocketConnectorType.input : SocketConnectorType.output;
    }

    // producer client code to trigger publishing
    onPublishMessageModelState(newState: MessageModelState, type: DeliveryMessageChangeType) {
        this._publishMessageModelStateSubject$.next(new DeliveryMessage(newState, type));
    }

}

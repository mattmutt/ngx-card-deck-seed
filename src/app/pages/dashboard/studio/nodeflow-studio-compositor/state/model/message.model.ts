import { SocketModel } from "./socket.model";
import { BehaviorSubject, Observable, Subject } from "rxjs";


export interface MessageModelForm {
    component: string; // nomenclature for identifying a view representation
}

export interface MessageModelState {
    classifier: string; // define the format of data. The `topic` attribute is only a "channel", not a payload schematic
    data: any | null; // business specifics
}

export class MessageModel {
    topic: string; //binding link to the producer socket
    form: MessageModelForm;
    // outbound message passed over stream
    socket: SocketModel;
    private _messageStateDataChangeSubject$ = new BehaviorSubject<MessageModel>(null as any); // when nodeProducer get a new message state assigned
    private readonly _messageStateDataChange$: Subject<MessageModel>; // when nodeProducer get a new message state assigned

    // actor associations
    private _state: MessageModelState;

    constructor() {
        this._messageStateDataChange$ = this._messageStateDataChangeSubject$;
    }

    // alias
    // get topic() { return this.socket.topic; }

    // not recommended to observe the message directly.
    // may deprecate if no real use case
    get selectMessageStateData$(): Observable<MessageModel> {
        return this._messageStateDataChange$;
    }

    get state(): MessageModelState {
        return this._state;
    }

    // when state is assigned synchronously, consider this an initialization
    set state(modelState: MessageModelState) {
        this._state = modelState;
        this._messageStateDataChangeSubject$.next(this);
    }

}



import { FormBuilder, FormGroup } from "@angular/forms";
import { MessageModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/message.model";
import { MessageConnectorsRouteManager } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/collection/message-connectors-route-manager.model";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { SocketConnectorRelationStateType } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { NodeModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { BehaviorSubject } from "rxjs";


const resources = {

    types: {
        // connector state
        stateTypeMap: new Map([
            ["invalid", SocketConnectorRelationStateType.invalid],
            ["valid", SocketConnectorRelationStateType.valid],
            ["unknown", SocketConnectorRelationStateType.unknown]
        ]) as Map<string, SocketConnectorRelationStateType>,
        stateTypeList: [] as Array<[string, SocketConnectorRelationStateType]>,
        // this change list contains dynamic counts
        stateTypeListChange$: null as any as BehaviorSubject<Array<[string, SocketConnectorRelationStateType]>>,
        stateTypeEnum: SocketConnectorRelationStateType,
    }

};

export abstract class SimulatorFormViewBase {

    public messagesForm: FormGroup;
    // model constraints on select form fields
    public types = resources.types;

    protected _messageConnectivityDelegate: MessageConnectorsRouteManager;

    constructor(protected fb: FormBuilder) {
        this.messagesForm = this.fb.group({});
        this.types.stateTypeList = Array.from(this.types.stateTypeMap);
        this.types.stateTypeListChange$ = new BehaviorSubject<Array<[string, SocketConnectorRelationStateType]>>(this.types.stateTypeList);

        this.refreshInternalModel();
    }


    // select list
    stateTypeClass(dropdownStateType: SocketConnectorRelationStateType): object {
        return {
            "invalid-state": dropdownStateType === SocketConnectorRelationStateType.invalid,
            "unknown-state": dropdownStateType === SocketConnectorRelationStateType.unknown,
            "valid-state": dropdownStateType === SocketConnectorRelationStateType.valid
        };

    }

    // business logic for looking up a route relation
    findRouteRelationByMessage(message: MessageModel): MessageConnectorsRouteRelationModel | undefined {
        const matches = this._messageConnectivityDelegate.getRouteRelationListByMessage(message);
        if (matches.length > 1) {
            console.error("yielded multiple route relations for message. Consider as *inconsistent* form", message.topic, message, matches);
        }

        return matches.length ? matches[0] : undefined;
    }

    isRouteRelationSubscribed(rr: MessageConnectorsRouteRelationModel): boolean {
        return rr && rr.connectors.size > 0;
    }

    // template usage: denotes if footer can be interacted with
    isRouteRelationDisabled(rr: MessageConnectorsRouteRelationModel): string | null {
        return !this.isRouteRelationSubscribed(rr) ? "" : null;
    }

    setMessageConnectivityDelegate(mcrm: MessageConnectorsRouteManager) {
        this._messageConnectivityDelegate = mcrm;
    }

    onSocketConnectorRelationCollectionChange() {
        this.refreshInternalModel();
    }

    //
    abstract createViewForm(nodeModel: NodeModel): void;

    // the state type list must update since an external change was detected
    private refreshInternalModel() {

        this.types.stateTypeList = Array.from(this.types.stateTypeList); // refreshable list
        this.types.stateTypeListChange$.next(this.types.stateTypeList);
    }

}

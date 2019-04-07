import { Injectable } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { NodeModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import {
    MessageModel,
    MessageModelState
} from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/message.model";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { SimulatorFormViewBase } from "./simulator-form-view-base.class";
import { DeliveryMessageChangeType } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/delivery-message.model";
import { SimulatorProducerFormViewProviderMessageBroadcastHistory } from "./simulator-producer-form-view.interface";

const resources = {

    form: {
        privateFieldPrefix: "__",
        privateFieldPropertyToken: "/",
        socketConnectorRelationStateTypeControlName: "stateType"
    },

};

@Injectable()
export class SimulatorProducerFormViewProvider extends SimulatorFormViewBase {

    messageBroadcastHistory: SimulatorProducerFormViewProviderMessageBroadcastHistory;

    constructor(protected fb: FormBuilder) {
        super(fb);
    }

    // create a series of structured form hierarchies based upon the schematics of the `messages` collection
    public createViewForm(nodeModel: NodeModel) {

        if (nodeModel.producer && nodeModel.producer.messageCollection.size) {
            nodeModel.producer.messageCollection.forEach((messageModel) => {
                this.messagesForm.addControl(messageModel.form.component, this.createMessagesForm(messageModel, nodeModel));
            });
        }

    }

    // allow sending part of the form while
    submitSubform(subform: FormGroup, matchedRouteRelation: MessageConnectorsRouteRelationModel, messageRecord: MessageModel, ownerNode: NodeModel) {
        if (ownerNode.producer) {

            // directs message to route relation's children socket connectors by selected `SocketConnectorRelationStateType` from dropdown
            const deliveryStatus$ = matchedRouteRelation.broadcastMessageState$(messageRecord,
                this.buildImmutableState(subform, messageRecord, ownerNode),
                DeliveryMessageChangeType.update,
                this.findStateTypeControl(subform, messageRecord).value);

            this.onBroadcastMessage(matchedRouteRelation, messageRecord, ownerNode, deliveryStatus$, new Date());

            // messageRecord.dispatchMessageStateData(this.buildImmutableState(subform, messageRecord, ownerNode));
        }
        subform.markAsPristine();
    }

    // send button interaction
    isSubformDisabled(subform: FormGroup, matchedRouteRelation: MessageConnectorsRouteRelationModel): boolean {
        return !((matchedRouteRelation.connectors && matchedRouteRelation.connectors.size > 0) && subform.dirty);
    }

    // send button interaction
    isSubformSubmissible(subform: FormGroup, matchedRouteRelation: MessageConnectorsRouteRelationModel): boolean {
        return (matchedRouteRelation.connectors && matchedRouteRelation.connectors.size > 0);
    }


    resetSubform(subform: FormGroup, messageRecord: MessageModel, ownerNode: NodeModel) {
        subform.reset(messageRecord.state.data);
    }


    // each subform has additional metadata configuration per submission
    findStateTypeControl(subform: FormGroup, messageModel: MessageModel): FormControl {
        return subform.get(this.generateSubformInteralControlName("stateType", messageModel)) as FormControl;
    }

    // account for latest transmission
    onBroadcastMessage(matchedRouteRelation: MessageConnectorsRouteRelationModel, messageRecord: MessageModel, ownerNode: NodeModel, deliveryStatus$: Observable<boolean>, publishedDate: Date): SimulatorProducerFormViewProviderMessageBroadcastHistory {

        this.messageBroadcastHistory = {
            publishedDate,
            matchedRouteRelation,
            messageRecord,
            ownerNode,
            deliveryStatus$,
            receivedDate: null
        };

        deliveryStatus$.subscribe(() => this.messageBroadcastHistory.receivedDate = new Date());

        return this.messageBroadcastHistory;
    }

    protected createMessagesForm(messageModel: MessageModel, ownerNodeModel: NodeModel): FormGroup {

        const messagesForm = this.fb.group({},
            //            {validator: Validators.compose([this.nodeflowAgentService.isNodeCircularReferenceConnectorRule])}
        );

        // pre-populate fields
        Object.keys(messageModel.state.data).forEach((fieldIdentifier) => {
            const latestBoundFieldValue = messageModel.state.data[fieldIdentifier];
            messagesForm.addControl(fieldIdentifier, new FormControl(latestBoundFieldValue,
                latestBoundFieldValue !== null ? Validators.required : undefined));
        });

        // a message may not be associated to any sockets, hence route relation
        if (!this.findRouteRelationByMessage(messageModel)) {
            messagesForm.disable();
        }

        // state type filter selection to apply to the message about to be sent
        messagesForm.addControl(this.generateSubformInteralControlName(resources.form.socketConnectorRelationStateTypeControlName, messageModel), new FormControl(null, Validators.required));
        return messagesForm;
    }

    // when data state is changed, only an immutable record can be guaranteed for pushing as change detection
    // needs for intelligence to generically transfer the subform when nested models are contained
    protected buildImmutableState(subform: FormGroup, messageModel: MessageModel, ownerNodeModel: NodeModel): MessageModelState {

        const classifier = messageModel.state.classifier;
        const data: object = Object.assign({}, messageModel.state.data);

        Object.keys(data).forEach(stateKey => {
            if (subform.contains(stateKey)) {
                const subformControl = subform.get(stateKey) as FormControl;
                data[stateKey] = subformControl.value;
            }
        });

        return {classifier, data};
    }


    // private and "lightly" enshrouded field name, scoped by message form component id, to be filtered out later
    private generateSubformInteralControlName(controlName: string, messageModel: MessageModel): string {
        return resources.form.privateFieldPrefix + btoa([messageModel.form.component, controlName].join(resources.form.privateFieldPropertyToken));
    }
}

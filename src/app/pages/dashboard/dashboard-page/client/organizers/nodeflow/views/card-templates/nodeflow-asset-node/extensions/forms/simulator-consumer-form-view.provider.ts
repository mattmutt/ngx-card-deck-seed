import { Injectable } from "@angular/core";
import { NodeModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { FormBuilder, FormGroup } from "@angular/forms";
import { SimulatorFormViewBase } from "./simulator-form-view-base.class";
import { SocketModel } from "../../../../../../../../../studio/nodeflow-studio-compositor/state/model/socket.model";


const resources = {};

@Injectable()
export class SimulatorConsumerFormViewProvider extends SimulatorFormViewBase {

    constructor(protected fb: FormBuilder) {
        super(fb);
    }

    // create a series of structured form hierarchies based upon the schematics of the `messages` collection
    public createViewForm(nodeModel: NodeModel) {

        // restrict to models having consumer socket(s) established upfront
        if (nodeModel.link && nodeModel.link.consumerSocketCollection.size) {

            nodeModel.link.consumerSocketCollection.forEach((boundConsumerSocket) => {
                this.messagesForm.addControl(boundConsumerSocket.id, this.createSocketRouteRelationReceivableForm(boundConsumerSocket, nodeModel));
            });

            // this.messagesForm.addControl(messageModel.form.component, this.createMessagesForm(messageModel, nodeModel));

        } else {
            // orphan asset edge case
            // console.log("node missing consumer linked sockets at creation time. dynamic addition unsupported");
        }

        /*
        if (nodeModel.producer && nodeModel.producer.messageCollection.size) {
            nodeModel.producer.messageCollection.forEach((messageModel) => {
                this.messagesForm.addControl(messageModel.form.component, this.createMessagesForm(messageModel, nodeModel));
            });
        }
        */

    }

    // findStateTypeControl(subform: FormGroup, messageModel: MessageModel): FormControl {
    //     return subform.get(this.generateSubformInteralControlName("stateType", messageModel)) as FormControl;
    // }


    // based upon socket
    protected createSocketRouteRelationReceivableForm(consumerSocket: SocketModel, ownerNodeModel: NodeModel): FormGroup {

        const socketForm = this.fb.group({},
            //            {validator: Validators.compose([this.nodeflowAgentService.isNodeCircularReferenceConnectorRule])}
        );

        // the linked route relations for consumer socket. If multicast, must accept different message models origins ( but marked as same topic)
        const assignedRouteRelationList = this._messageConnectivityDelegate.getRouteRelationListBySocket(consumerSocket);


        /*
        assignedRouteRelationList.forEach((mcrrm) => {

//const  d =new FormGroup({ name: new FormControl(val), })
const  subform =new FormGroup({ [mcrrm.]: new FormControl(val), })

            socketForm.
            this.messagesForm.addControl(boundConsumerSocket.id, this.createMessagesForm(boundConsumerSocket, nodeModel));

        });
        */

        // pre-populate fields
        /*
        Object.keys(messageModel.state.data).forEach((fieldIdentifier) => {
            const latestBoundFieldValue = messageModel.state.data[fieldIdentifier];
            messagesForm.addControl(fieldIdentifier, new FormControl(latestBoundFieldValue,
                latestBoundFieldValue !== null ? Validators.required : undefined));
        });

        // a message may not be associated to any sockets, hence route relation
        if (!this.findRouteRelationByMessage(messageModel)) {
            messagesForm.disable();
        }
        */

        // state type filter selection to apply to the message about to be sent
        // messagesForm.addControl(this.generateSubformInteralControlName(resources.form.socketConnectorRelationStateTypeControlName, messageModel), new FormControl(null, Validators.required));
        return socketForm;
    }

    // when data state is changed, only an immutable record can be guaranteed for pushing as change detection
    /*
    protected buildImmutableState(subform: FormGroup, messageModel: MessageModel, ownerNodeModel: NodeModel): object {
        const data: object = Object.assign({}, messageModel.state.data);

        Object.keys(data).forEach(stateKey => {
            if (subform.contains(stateKey)) {
                const subformControl = subform.get(stateKey) as FormControl;
                data[stateKey] = subformControl.value;
            }
        });

        return data;
    }
    */

}

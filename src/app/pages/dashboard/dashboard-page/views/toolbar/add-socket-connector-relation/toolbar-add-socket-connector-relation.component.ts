import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
    SocketConnectorType,
    SocketModel
} from "../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { NodeModel } from "../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import { SocketConnectorRelationStateType } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { ToolbarAddSocketConnectorRelationAgentService } from "./toolbar-add-socket-connector-relation-agent.service";
import { distinctUntilChanged, pairwise } from "rxjs/operators";
import { ToolbarNodeflowActionBase } from "../toolbar-nodeflow-action-base";


const resources = {

    form: {
        producerSocket: {default: null},
        consumerSocket: {default: null},
        isProducerMessageStateCloned: {default: false},
        isVerboseMode: {default: false},
        stateType: {default: SocketConnectorRelationStateType.valid},
    }

};

@Component({
    selector: 'nodeflow-toolbar-add-socket-connector-relation',
    templateUrl: './toolbar-add-socket-connector-relation.html',
    styleUrls: ['./toolbar-add-socket-connector-relation.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarAddSocketConnectorRelationComponent extends ToolbarNodeflowActionBase implements OnInit, OnDestroy, OnChanges {

    // the dashboard demo app doesn't really care about socket connector creation events
    // tslint:disable-next-line:no-output-rename
    // @Output("addSocketConnectorRelation") addSocketConnectorRelation$: EventEmitter<SockerConnectorRelation> = new EventEmitter();

    constructor(private fb: FormBuilder,
                private _cdr: ChangeDetectorRef,
                private nodeflowAgentService: ToolbarAddSocketConnectorRelationAgentService,
                protected gridStateManagerService: NodeflowStudioGridStateManagerService) {
        super(gridStateManagerService);

    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
    }


    // ======================= Nodeflow User Interactions ===================
    onAddSocketConnectorRelationEvent() {

        const [linkStateType, producerSocket, consumerSocket] = ["stateType", "producerSocket", "consumerSocket"]
            .map((f) => this.toolbarNodeflowBehaviorActionForm.get(f)!.value);

        const gca = this.resolvedNodeflow.pageComponent.gridContainerAssemblyInstance;

        const [isProducerMessageStateCloned] = ["isProducerMessageStateCloned"]
            .map((f) => this.toolbarNodeflowBehaviorActionForm.get(f)!.value);

        this.nodeflowAgentService.addSocketConnectorRelation$(producerSocket, consumerSocket, linkStateType,
            isProducerMessageStateCloned,
            this.resolvedNodeflow,
            gca,
            this.resolvedNodeflow.updateViewTransition.bind(this.resolvedNodeflow)
        ).subscribe(
            (socketConnectorRelation) => {
                this.processingErrorMessage = undefined;
            },
            (bad) => {
                this.processingErrorMessage = bad; // propagate processing error strings
                // console.error("could not add relation", bad);
            },
            () => {
                this.toolbarNodeflowBehaviorActionForm.reset({
                    stateType: resources.form.stateType.default,
                    isProducerMessageStateCloned: resources.form.isProducerMessageStateCloned.default
                });
                // can only occur after view updates, reset subform state
                [producerSocket.value, consumerSocket.value].filter(Boolean).forEach((remoteSocket) =>
                    this.resolvedNodeflow.onSocketViewSelectingStateChangeEvent(remoteSocket, false)
                );

            });


    }


    // validation: derive useful warning message
    adviseSocketCapabilityValidationErrors(nodeModel: NodeModel, socket: SocketModel): Set<{ code: string, label: string }> {
        return this.nodeflowAgentService.generateValidationErrors(nodeModel, socket, this.toolbarNodeflowBehaviorActionForm.get("producerSocket")!.value as SocketModel | null);
    }

    // validation: check if any error would result if assigning this socket to the new nodeflow
    checkSocketCapabilityValidationErrors(nodeModel: NodeModel, socket: SocketModel): boolean {
        return this.adviseSocketCapabilityValidationErrors(nodeModel, socket).size > 0;
    }


    // depending on whether or not the option group has potential children, show or hide the group header item
    // logic cloned from `ToolbarAddNodeflowAgentService`
    showSelectListOptionGroup(nodeModel: NodeModel, opposingSocketDirectionType: SocketConnectorType): boolean {

        if (nodeModel.link) {
            const candidateSockets = nodeModel.link.getCollectionByType(opposingSocketDirectionType);
            const candidateSocketsCount = candidateSockets.size;

            // default mode
            if (!this.selectedIsVerboseMode) {

                if (candidateSocketsCount > 0) {
                    const errorCount = Array.from(candidateSockets)
                        .reduce((accumulator2, socket) => (accumulator2 + (+this.checkSocketCapabilityValidationErrors(nodeModel, socket))), 0);

                    return candidateSocketsCount !== errorCount;

                } else {
                    return candidateSocketsCount > 0;
                }

                // show all errors as disabled items
            } else {

                return candidateSocketsCount > 0;
            }
        } else {
            return false; // missing possibility of having linking sockets
        }

    }

    protected createForm(): FormGroup {

        const form = this.fb.group({
                stateType: [resources.form.stateType.default, [Validators.required]],
                isProducerMessageStateCloned: [resources.form.isProducerMessageStateCloned.default, [Validators.required]],
                producerSocket: [resources.form.producerSocket.default, [Validators.required]],
                consumerSocket: [resources.form.consumerSocket.default, [Validators.required]],
                isVerboseMode: [resources.form.isVerboseMode.default, []]
            },
            {validator: Validators.compose([this.nodeflowAgentService.isNodeCircularReferenceConnectorRule])}
        );


        this.toolbarForm.addControl("addSocketConnectorRelation", form);

        // auto highlights socket upon selecting from list
        const socketSelectorList = ["producerSocket", "consumerSocket"].map((f) => form.get(f)!);

        // auto highlights socket upon selecting from list
        for (const socketSelectionControl of socketSelectorList) {
            // set highlight on intended socket as confirmation of action
            socketSelectionControl.valueChanges.pipe(distinctUntilChanged(), pairwise())
                .subscribe((socketSelectionPair: Array<SocketModel | null>) => {
                    socketSelectionPair.forEach((socket, idx) => {
                        if (socket) {
                            this.resolvedNodeflow.onSocketViewSelectingStateChangeEvent(socket, idx === 1);
                        }
                    });
                });
            socketSelectionControl.setValue(socketSelectionControl.value);
        }

        return form;
    }

}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
    SocketConnectorType,
    SocketModel
} from "../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import {
    SocketConnectorRelationModel,
    SocketConnectorRelationStateType
} from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { ToolbarRemoveSocketConnectorRelationAgentService } from "./toolbar-remove-socket-connector-relation-agent.service";
import { ToolbarNodeflowActionBase } from "../toolbar-nodeflow-action-base";
import { MessageConnectorsRouteRelationModel } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { distinctUntilChanged, pairwise } from "rxjs/operators";


const resources = {
    form: {
        stateType: {default: SocketConnectorRelationStateType.valid},
        socketConnectorType: {default: SocketConnectorType.output},
        isEmptyRouteRelationModelDereference: {default: false},
        socketConnectorRelation: {default: null},
        isVerboseMode: {default: false}
    }
};

@Component({
    selector: 'nodeflow-toolbar-remove-socket-connector-relation',
    templateUrl: './toolbar-remove-socket-connector-relation.html',
    styleUrls: ['./toolbar-remove-socket-connector-relation.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarRemoveSocketConnectorRelationComponent extends ToolbarNodeflowActionBase {

    // the dashboard demo app doesn't really care about socket connector removal events
    // tslint:disable-next-line:no-output-rename
    // @Output("addSocketConnectorRelation") addSocketConnectorRelation$: EventEmitter<SocketConnectorRelation> = new EventEmitter();


    constructor(private fb: FormBuilder,
                private _cdr: ChangeDetectorRef,
                private nodeflowAgentService: ToolbarRemoveSocketConnectorRelationAgentService,
                protected gridStateManagerService: NodeflowStudioGridStateManagerService) {
        super(gridStateManagerService);


    }

    // chosen connector relation
    get selectedSocketConnectorRelation(): SocketConnectorRelationModel {
        return this.toolbarNodeflowBehaviorActionForm.get('socketConnectorRelation')!.value;
    }


    // chosen direction for perspective
    get selectedSocketConnectorType(): SocketConnectorType {
        return this.toolbarNodeflowBehaviorActionForm.get('socketConnectorType')!.value;
    }


    // lookup perspective socket based upon reference of directed `socketConnectorType` preference
    get selectedSocketConnectorRelationPerspectiveSocket(): SocketModel | undefined {
        const socketConnectorRelation: SocketConnectorRelationModel = this.selectedSocketConnectorRelation;

        return (socketConnectorRelation ? (this.selectedSocketConnectorType === SocketConnectorType.input)
            ? socketConnectorRelation.consumer
            : socketConnectorRelation.producer
            : undefined);
    }


    // lookup containing route relation by selected connector
    get selectedRouteRelation(): MessageConnectorsRouteRelationModel | undefined {
        const socketConnectorRelation: SocketConnectorRelationModel = this.selectedSocketConnectorRelation;

        return (socketConnectorRelation
            ? this.gridStateManagerService.routes.findRouteRelationBySocketConnectorRelation(socketConnectorRelation)
            : undefined);
    }

    // ======================= Nodeflow User Interactions ===================
    onRemoveSocketConnectorRelationEvent() {
        const socketConnectorRelation = this.selectedSocketConnectorRelation;
        const gca = this.resolvedNodeflow.pageComponent.gridContainerAssemblyInstance;

        const [isEmptyRouteRelationModelDereference] = ["isEmptyRouteRelationModelDereference"]
            .map((f) => this.toolbarNodeflowBehaviorActionForm.get(f)!.value);


        this.nodeflowAgentService.removeSocketConnectorRelation$(socketConnectorRelation, isEmptyRouteRelationModelDereference,
            this.resolvedNodeflow,
            gca,
            this.resolvedNodeflow.updateViewTransition.bind(this.resolvedNodeflow)
        ).subscribe(
            (routeRelation) => {
                // show new collection size and if emptied
                console.log("after connector removal, route relation collection size", routeRelation.connectors.size);

                this.processingErrorMessage = undefined;
            },

            (bad) => {
                this.processingErrorMessage = bad; // propagate processing error strings
            },

            () => {
                this.resolvedNodeflow.onSocketConnectorRelationBeforeMovingStateChangeEvent(socketConnectorRelation, false);

                this.toolbarNodeflowBehaviorActionForm.reset({
                    stateType: this.selectedLinkStateType,
                    socketConnectorType: this.selectedSocketConnectorType,
                    isEmptyRouteRelationModelDereference: resources.form.isEmptyRouteRelationModelDereference.default
                });
            });
    }

    protected createForm(): FormGroup {

        const form = this.fb.group({
                stateType: [resources.form.stateType.default, []],
                socketConnectorType: [resources.form.socketConnectorType.default, [Validators.required]],
                // post processing
                isEmptyRouteRelationModelDereference: [resources.form.isEmptyRouteRelationModelDereference.default, [Validators.required]],

                // join pair of sockets
                socketConnectorRelation: [resources.form.socketConnectorRelation.default, [Validators.required]],
                isVerboseMode: [resources.form.isVerboseMode.default, []]
            },
            //            {validator: Validators.compose([this.nodeflowAgentService.isNodeCircularReferenceConnectorRule])}
        );
        this.toolbarForm.addControl("removeSocketConnectorRelation", form);
        const scrControl = form.get("socketConnectorRelation")!;

        // dependency: reset relation when state trigger switches
        form.get('stateType')!.valueChanges.subscribe((val) => scrControl.reset(resources.form.socketConnectorRelation.default));


        // auto highlights both sockets attached to selected connector relation model
        scrControl.valueChanges.pipe(distinctUntilChanged(), pairwise())
            .subscribe((connectorRelationPair: Array<SocketConnectorRelationModel | null>) => {
                connectorRelationPair.forEach((connectorRelation, idx) => {
                    if (connectorRelation) {
                        this.resolvedNodeflow.onSocketConnectorRelationBeforeMovingStateChangeEvent(connectorRelation, idx === 1);
                    }
                });
            });
        // advances stream
        scrControl.setValue(form.get("socketConnectorRelation")!.value);

        return form;
    }


}

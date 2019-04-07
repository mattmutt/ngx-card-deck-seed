import { NodeflowAssetNodeComponent } from "../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.component";
import { NodeflowStudioCompositorComponent } from "../../../studio/nodeflow-studio-compositor/nodeflow-studio-compositor.component";
import { Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewContainerRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { NodeModel } from "../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { NodeflowStudioGridStateManagerService } from "../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import {
    SocketConnectorRelationModel,
    SocketConnectorRelationStateType
} from "../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { SocketConnectorType } from "../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { DashboardConfigurationSchema } from "ngx-card-deck";

const resources = {
    types: {

        stateTypeMap: new Map([
            ["invalid", SocketConnectorRelationStateType.invalid],
            ["valid", SocketConnectorRelationStateType.valid],
            ["unknown", SocketConnectorRelationStateType.unknown]
        ]) as Map<string, SocketConnectorRelationStateType>,
        stateTypeList: [] as Array<[string, SocketConnectorRelationStateType]>,
        stateTypeEnum: SocketConnectorRelationStateType,

        socketConnectorTypeMap: new Map([
            ["input", SocketConnectorType.input],
            ["output", SocketConnectorType.output]
        ]) as Map<string, SocketConnectorType>,
        socketConnectorTypeList: [] as Array<[string, SocketConnectorType]>,
        socketConnectorTypeEnum: SocketConnectorType
    }
};

export abstract class ToolbarNodeflowActionBase implements OnInit, OnChanges, OnDestroy {
    @Input() toolbarForm: FormGroup; // top level form container that wraps all toolbar action items
    @Input() nodeflow: ViewContainerRef; // loose coupling for nodeflow studio backing component

    toolbarNodeflowBehaviorActionForm: FormGroup; // each action component subclass will create its own stateful form
    resolvedNodeflow: NodeflowStudioCompositorComponent; // resolves via VCR
    nodeCollectionChange$: Observable<Array<NodeModel>>; //surfaced from NodeflowStudioGridStateManagerService
    nodeCollectionCache$: Observable<Array<NodeModel>>;
    processingErrorMessage: string | undefined; // propagate processing error strings

    // model constraints on select form fields
    types = resources.types;

    socketConnectorRelationModelCollection$: Observable<Array<SocketConnectorRelationModel>>;
    projectConfigurationSubscription: Subscription;

    constructor(protected gridStateManagerService: NodeflowStudioGridStateManagerService) {
        this.nodeCollectionChange$ = this.gridStateManagerService.nodeCollectionChange$;
        this.nodeCollectionCache$ = this.gridStateManagerService.nodeCollectionCache$;

        // template iterable
        this.types.stateTypeList = Array.from(this.types.stateTypeMap);
        this.types.socketConnectorTypeList = Array.from(this.types.socketConnectorTypeMap);
    }

    // list of non-destroyed plugins
    get nodeflowPluginList(): Array<NodeflowAssetNodeComponent<any, any, any, any>> {
        return this.resolvedNodeflow.pageComponent.gridContainerAssemblyInstance.cardAssemblyPluginList as Array<NodeflowAssetNodeComponent<any, any, any, any>>;
    }


    // Verbose checkbox
    get selectedIsVerboseMode(): boolean {
        return this.toolbarNodeflowBehaviorActionForm.get('isVerboseMode')!.value;
    }

    // Link State on SocketConnectorRelation
    get selectedLinkStateType(): SocketConnectorRelationStateType | undefined {
        return this.toolbarNodeflowBehaviorActionForm.get('stateType')!.value;
    }

    // reference to the underlying configuration post-processed metadata of the deck
    get currentProjectDashboardConfiguration(): DashboardConfigurationSchema | undefined {
        return this.resolvedNodeflow ? this.resolvedNodeflow.pageComponent.componentConfiguration : undefined;
    }


    stateTypeClass(dropdownStateType: SocketConnectorRelationStateType): object {
        return {
            "invalid-state": dropdownStateType === SocketConnectorRelationStateType.invalid,
            "unknown-state": dropdownStateType === SocketConnectorRelationStateType.unknown,
            "valid-state": dropdownStateType === SocketConnectorRelationStateType.valid
        };
    }

    // await compositor prior to building out
    ngOnChanges(changes: SimpleChanges) {

        // asynchronously assigned nodeflow after item initializes upfront. will receive VCR to unpack
        if (changes.nodeflow && changes.nodeflow.currentValue) {
            this.resolvedNodeflow = (changes.nodeflow.currentValue.injector as Injector).get<NodeflowStudioCompositorComponent>(NodeflowStudioCompositorComponent);

            this.projectConfigurationSubscription = this.resolvedNodeflow.pageComponent.dashboardConfiguration$
                .subscribe((dashboardConfigurationSchema: DashboardConfigurationSchema) =>
                    this.onDashboardConfigurationChange(dashboardConfigurationSchema));

            this.onResolveNodeflowComponent(this.resolvedNodeflow);
        }
    }

    ngOnInit() {
        // observe modeled socket connector changes
        this.socketConnectorRelationModelCollection$ = this.gridStateManagerService.routes.socketConnectorRelationCollectionChange$;

        this.toolbarNodeflowBehaviorActionForm = this.createForm();

    }

    ngOnDestroy() {

        if (this.projectConfigurationSubscription) {
            this.projectConfigurationSubscription.unsubscribe();
        }
    }

    // extend for reacting to route changes that imply a project configuration change
    protected onDashboardConfigurationChange(configuration: DashboardConfigurationSchema) {

    }

    // extend if waiting on component
    protected onResolveNodeflowComponent(cmp: NodeflowStudioCompositorComponent) {

    }

    protected abstract createForm(): FormGroup;
}


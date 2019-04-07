import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import { ToolbarNodeflowActionBase } from "../toolbar-nodeflow-action-base";
import { ToolbarSerializeModelAgentService } from "./toolbar-serialize-model-agent.service";
import {
    ToolbarSerializedDocumentEntityPackagingType,
    ToolbarSerializedDocumentEntityReference
} from "./toolbar-serialize-model.model";
import { NodeflowAssetNodeComponent } from "../../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.component";
import { NodeflowStudioCompositorComponent } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-compositor.component";
import { DashboardConfigurationSchema } from "ngx-card-deck";

const resources = {
    types: {
        packagingFormatTypeMap: new Map([
            ["nativeDashboardResourceJson", ToolbarSerializedDocumentEntityPackagingType.nativeDashboardResourceJson],
            ["nodeflowConfigurationSchemaJson", ToolbarSerializedDocumentEntityPackagingType.nodeflowConfigurationSchemaJson],
        ]) as Map<string, ToolbarSerializedDocumentEntityPackagingType>,

        packagingFormatLabelMap: new Map([
            [ToolbarSerializedDocumentEntityPackagingType.nativeDashboardResourceJson, "ResourceFacade Native"],
            [ToolbarSerializedDocumentEntityPackagingType.nodeflowConfigurationSchemaJson, "Nodeflow Standard"]
        ]) as Map<ToolbarSerializedDocumentEntityPackagingType, string>,

        stateTypeList: [] as Array<[string, ToolbarSerializedDocumentEntityPackagingType]>,
        stateTypeEnum: ToolbarSerializedDocumentEntityPackagingType,
    },


    form: {
        serializedDocumentEntityReference: {default: null},
        packagingFormatType: {default: ToolbarSerializedDocumentEntityPackagingType.nodeflowConfigurationSchemaJson},
        isVerboseMode: {default: false}
    }
};


@Component({
    selector: 'nodeflow-toolbar-serialize-model',
    templateUrl: './toolbar-serialize-model.html',
    styleUrls: ['./toolbar-serialize-model.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarSerializeModelComponent extends ToolbarNodeflowActionBase {

    // demo list of "available" model documents
    availableSerializedDocumentList: Array<ToolbarSerializedDocumentEntityReference> = [];
    packagingFormatTypeList: Array<[string, ToolbarSerializedDocumentEntityPackagingType]>;
    packagingFormatLabelMap: Map<ToolbarSerializedDocumentEntityPackagingType, string>;

    constructor(private fb: FormBuilder,
                private _cdr: ChangeDetectorRef,
                private nodeflowAgentService: ToolbarSerializeModelAgentService,
                protected gridStateManagerService: NodeflowStudioGridStateManagerService) {
        super(gridStateManagerService);

        this.packagingFormatTypeList = Array.from(resources.types.packagingFormatTypeMap);
        this.packagingFormatLabelMap = resources.types.packagingFormatLabelMap;

    }

    // chosen document instance (ref)
    get selectedSerializedDocumentEntityReference(): ToolbarSerializedDocumentEntityReference {
        return this.toolbarNodeflowBehaviorActionForm.get('serializedDocumentEntityReference')!.value;
    }

    get selectedPackagingFormatType(): ToolbarSerializedDocumentEntityPackagingType {
        return this.toolbarNodeflowBehaviorActionForm.get('packagingFormatType')!.value;
    }

    // generated document must take identifier to establish itself
    get selectedNewDocumentIdentifier(): string {
        return this.toolbarNodeflowBehaviorActionForm.get('newDocumentIdentifier')!.value;
    }

    formatShortDateTime(dt: Date): string {
        return [this.formatShortDate(dt), this.formatShortTime(dt)].join(" @ ");
    }

    formatShortDate(dt: Date): string {
        return dt && dt.toLocaleDateString('en-US');
    }

    formatShortTime(dt: Date): string {
        return dt && [dt.getHours(), (dt.getMinutes() < 10 ? "0" : "") + dt.getMinutes()].join(":");
    }


    calculateContentSize(content: string): string {
        let unitFactorLabel = "bytes";
        let unitFactor = 1;
        const contentSize = content.length;

        if (contentSize > 1000) {
            unitFactorLabel = "kb";
            unitFactor = 1024;
        }

        // tslint:disable-next-line:no-bitwise
        return [(contentSize / unitFactor) >> 0, unitFactorLabel].join(" ");
    }

    // ======================= Nodeflow User Interactions ===================
    onSerializeNodeflowProjectModelEvent() {
        const gca = this.resolvedNodeflow.pageComponent.gridContainerAssemblyInstance;


        this.nodeflowAgentService.serializeNodeflowProjectModel$(
            this.selectedNewDocumentIdentifier,
            gca.cardAssemblyPluginList as Array<NodeflowAssetNodeComponent<any, any, any, any>>, // upcast
            this.gridStateManagerService.routes,
            this.selectedPackagingFormatType)
            .subscribe(
                (docEntityRef) => {
                    this.processingErrorMessage = undefined;
                    // show new collection size and if emptied
                    // console.log("on document serialization complete", docEntityRef);

                    this.availableSerializedDocumentList.push(docEntityRef);

                    this.toolbarNodeflowBehaviorActionForm.get("serializedDocumentEntityReference")!.setValue(docEntityRef);
                },

                (bad) => {
                    this.processingErrorMessage = bad; // propagate processing error strings
                },

                () => {

                    this.toolbarNodeflowBehaviorActionForm.get("newDocumentIdentifier")!.reset();

                });

    }

    // assign a default field value of the current deck name
    onResolveNodeflowComponent(nodeflowComponent: NodeflowStudioCompositorComponent) {
        this.bindDocumentIdentifier(nodeflowComponent.pageComponent.componentConfiguration.id);
    }

    // when route changes project, reflect it in document ID as a courtesy
    onDashboardConfigurationChange(configuration: DashboardConfigurationSchema) {
        this.bindDocumentIdentifier(configuration.id);
    }

    protected createForm(): FormGroup {

        const form = this.fb.group({
                serializedDocumentEntityReference: [resources.form.serializedDocumentEntityReference.default, []],

                newDocumentIdentifier: [null, [Validators.required]],
                packagingFormatType: [resources.form.packagingFormatType.default, []],
                isVerboseMode: [resources.form.isVerboseMode.default, []]
            },
            //            {validator: Validators.compose([this.nodeflowAgentService.isNodeCircularReferenceConnectorRule])}
        );
        this.toolbarForm.addControl("serializeModel", form);


        return form;
    }

    private bindDocumentIdentifier(defaultDocumentId: string) {
        this.toolbarNodeflowBehaviorActionForm.get("newDocumentIdentifier")!.patchValue(defaultDocumentId);
    }
}

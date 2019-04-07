import { Component, EventEmitter, OnChanges, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { distinctUntilChanged, pairwise } from "rxjs/operators";
import { ViewAssemblyTypeStateResourceLayoutItemSchema } from "ngx-card-deck";
import { NodeflowAssetNodeComponent } from "../../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.component";
import { ToolbarRemoveNodeflowAgentService } from "./toolbar-remove-nodeflow-agent.service";
import { ToolbarNodeflowActionBase } from "../toolbar-nodeflow-action-base";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";

const resources = {

    form: {
        removeCardNodeReference: {default: null},
        isVerboseMode: {default: false}
    }

};

@Component({
    selector: 'nodeflow-toolbar-remove-nodeflow',
    templateUrl: './toolbar-remove-nodeflow.html',
    styleUrls: ['./toolbar-remove-nodeflow.scss']
})
export class ToolbarRemoveNodeflowComponent extends ToolbarNodeflowActionBase implements OnInit, OnDestroy, OnChanges {

    // when nodeflow is destroyed with its dependencies
    // tslint:disable-next-line:no-output-rename
    // @Output("removeLayoutItem") removeLayoutItem$: EventEmitter<ViewAssemblyTypeStateResourceLayoutItemSchema> = new EventEmitter();

    constructor(private fb: FormBuilder,
                private nodeflowAgentService: ToolbarRemoveNodeflowAgentService,
                protected gridStateManagerService: NodeflowStudioGridStateManagerService) {
        super(gridStateManagerService);

    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
    }

    // ======================= Nodeflow Actions ===================
    onRemoveNodeAssetEvent() {

        const selectedNodeAssetNodeComponent = this.toolbarNodeflowBehaviorActionForm.get("removeCardNodeReference")!.value as NodeflowAssetNodeComponent<any, any, any, any>;
        const nodeModel = selectedNodeAssetNodeComponent.viewModel.nodeModel; // ref preserve
        const gca = this.resolvedNodeflow.pageComponent.gridContainerAssemblyInstance;

        this.nodeflowAgentService.removeNodeflow$(selectedNodeAssetNodeComponent,
            this.resolvedNodeflow,
            gca,
            this.resolvedNodeflow.updateViewTransition.bind(this.resolvedNodeflow),
            this.resolvedNodeflow.pageComponent.layoutItemDestroy$
        ).subscribe(
            () => {
                this.processingErrorMessage = undefined;
                this.resolvedNodeflow.pageComponent.onGridLayoutItemRemove(nodeModel.view.gridItem.item as ViewAssemblyTypeStateResourceLayoutItemSchema);
            },
            (bad) => {
                this.processingErrorMessage = bad; // propagate processing error strings
            },
            () => {
                this.toolbarNodeflowBehaviorActionForm.reset();
                selectedNodeAssetNodeComponent.onSelectingStateChangeEvent(false);
            });

    }


    protected createForm(): FormGroup {

        const form = this.fb.group({
            removeCardNodeReference: [resources.form.removeCardNodeReference.default, [<any>Validators.required]],
            isVerboseMode: [resources.form.isVerboseMode.default, []]
        });
        this.toolbarForm.addControl("removeCard", form);

        const removeCardNodeReferenceControl = form.get("removeCardNodeReference")!;

        // transition to highlight next plugin as focused
        removeCardNodeReferenceControl.valueChanges.pipe(distinctUntilChanged(), pairwise())
            .subscribe((nodeflowPluginList: Array<NodeflowAssetNodeComponent<any, any, any, any | null>>) => {
                nodeflowPluginList.forEach((nodeflowPluginSelection, idx) => {
                    if (nodeflowPluginSelection) {
                        nodeflowPluginSelection.onSelectingStateChangeEvent(idx === 1);
                    }
                });
            });

        removeCardNodeReferenceControl.setValue(removeCardNodeReferenceControl.value);

        return form;
    }


}

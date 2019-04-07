import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    forwardRef,
    Inject,
    Input,
    OnInit
} from "@angular/core";
import { NodeModel } from "../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { NodeflowAssetNodeTemplateComponent } from "../../../nodeflow-asset-node-template.component";

@Component({
    selector: "nodeflow-asset-messages-consumer-collection",
    templateUrl: "./nodeflow-asset-messages-consumer-collection.html",
    styleUrls: ["./nodeflow-asset-messages-consumer-collection.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowAssetMessagesConsumerCollectionComponent implements OnInit {
    @Input() nodeModel: NodeModel;

    constructor(
        @Inject(forwardRef(() => NodeflowAssetNodeTemplateComponent)) public integrator: NodeflowAssetNodeTemplateComponent,
        private _cdr: ChangeDetectorRef
    ) {
        this.initialize();
    }

    ngOnInit() {
    }

    private initialize() {


        this.integrator.cardAssemblyPlugin.viewModel.onNodeConsumerRelationsChange$.subscribe((nodeOwnedRouteRelationList) => {
            // keep for debugging state mutation
            // console.log("a route relation changed", nodeOwnedRouteRelationList, "for node", this.integrator.cardAssemblyPlugin.viewModel.nodeModel.id);
        });

    }
}

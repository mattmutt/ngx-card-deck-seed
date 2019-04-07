import { ChangeDetectionStrategy, Component, forwardRef, Inject, Input, OnInit } from "@angular/core";
import { NodeModel } from "../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { NodeflowAssetNodeTemplateComponent } from "../../../nodeflow-asset-node-template.component";
import { SocketConnectorRelationStateType } from "../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";

@Component({
    selector: "nodeflow-asset-messages-producer-collection",
    templateUrl: "./nodeflow-asset-messages-producer-collection.html",
    styleUrls: ["./nodeflow-asset-messages-producer-collection.scss"],
    // not onpush so far...
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowAssetMessagesProducerCollectionComponent implements OnInit {
    @Input() nodeModel: NodeModel;

    constructor(
        @Inject(forwardRef(() => NodeflowAssetNodeTemplateComponent)) public integrator: NodeflowAssetNodeTemplateComponent,
    ) {
        this.initialize();
    }

    ngOnInit() {
    }


    private initialize() {

        // synchronized
        this.integrator.cardAssemblyPlugin.viewModel.onNodeConsumerRelationsChange$.subscribe((nodeOwnedRouteRelationList) => {
            this.integrator.simulatorProducerFormView.onSocketConnectorRelationCollectionChange();
        });

    }
}

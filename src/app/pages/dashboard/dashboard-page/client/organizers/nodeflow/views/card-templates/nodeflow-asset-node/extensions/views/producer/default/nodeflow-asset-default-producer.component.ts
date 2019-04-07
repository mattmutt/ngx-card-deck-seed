import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Inject, OnInit } from "@angular/core";
import {
    NODEFLOW_PROJECT1_PRODUCER_TOPIC_COMPONENT_RESOURCE_TOKEN,
    NodeflowProject1ProducerStateInjectable
} from "../../../../nodeflow-asset-node-token";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { SocketConnectorRelationStateType } from "../../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";

@Component({
    selector: "nodeflow-asset-default-producer",
    templateUrl: "./nodeflow-asset-default-producer.html",
    styleUrls: ["./nodeflow-asset-default-producer.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowAssetDefaultProducerComponent implements OnInit {

    constructor(
        @Inject(forwardRef(() => NODEFLOW_PROJECT1_PRODUCER_TOPIC_COMPONENT_RESOURCE_TOKEN)) public resourceState: NodeflowProject1ProducerStateInjectable,
        private _cdr: ChangeDetectorRef
    ) {

    }

    ngOnInit() {
        this.initialize();
    }

    // select list dropdown option item, count of linked relations filtered by link state type
    calculateLinkStateTypeBundledSocketConnectorRelationCount(matchedRouteRelation: MessageConnectorsRouteRelationModel, linkStateType: SocketConnectorRelationStateType): number {
        return matchedRouteRelation.getSocketConnectorRelationListByStateType(linkStateType).length;
    }


    private initialize() {
        // outside realm changes
        this.resourceState.integrator.cardAssemblyPlugin.viewModel.onNodeConsumerRelationsChange$.subscribe((nodeOwnedRouteRelationList) => {
            this._cdr.detectChanges();
        });
    }
}

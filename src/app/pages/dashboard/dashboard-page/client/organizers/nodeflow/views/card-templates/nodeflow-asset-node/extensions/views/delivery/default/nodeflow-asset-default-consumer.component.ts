import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Inject, OnInit } from "@angular/core";
import {
    NODEFLOW_PROJECT1_CONSUMER_TOPIC_COMPONENT_RESOURCE_TOKEN,
    NodeflowProject1ConsumerStateInjectable
} from "../../../../nodeflow-asset-node-token";

@Component({
    selector: "nodeflow-asset-default-consumer",
    templateUrl: "./nodeflow-asset-default-consumer.html",
    styleUrls: ["./nodeflow-asset-default-consumer.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowAssetDefaultConsumerComponent implements OnInit {

    constructor(
        @Inject(forwardRef(() => NODEFLOW_PROJECT1_CONSUMER_TOPIC_COMPONENT_RESOURCE_TOKEN)) public resourceState: NodeflowProject1ConsumerStateInjectable,
        private _cdr: ChangeDetectorRef
    ) {
        this.initialize();
    }

    ngOnInit() {
    }

    private initialize() {

        /*
        this.integrator.cardAssemblyPlugin.viewModel.onNodeConsumerRelationsChange$.subscribe((nodeOwnedRouteRelationList) => {
            // keep for debugging state mutation
            // console.log("a route relation changed", nodeOwnedRouteRelationList, "for node", this.integrator.cardAssemblyPlugin.viewModel.nodeModel.id);
        });
        */

    }
}

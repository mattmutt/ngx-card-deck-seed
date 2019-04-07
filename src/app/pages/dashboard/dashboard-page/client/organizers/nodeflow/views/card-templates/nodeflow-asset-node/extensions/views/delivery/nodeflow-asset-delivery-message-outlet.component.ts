import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Injector,
    Input,
    OnInit,
    Type,
    ViewContainerRef
} from "@angular/core";
import { NodeflowAssetNodeTemplateComponent } from "../../../nodeflow-asset-node-template.component";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { SocketConnectorRelationModel } from "../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import {
    NODEFLOW_PROJECT1_CONSUMER_TOPIC_COMPONENT_RESOURCE_TOKEN,
    NODEFLOW_PROJECT1_EXTENSION_CONSUMER_TOPIC_COMPONENT_MAP,
    NodeflowProject1ConsumerStateInjectable
} from "../../../nodeflow-asset-node-token";
import { NodeflowAssetDefaultConsumerComponent } from "./default/nodeflow-asset-default-consumer.component";


@Component({
    selector: "nodeflow-asset-delivery-message-outlet",
    template: "<ng-container *ngComponentOutlet=\"topicComponent; injector: consumerInjector;\"></ng-container>",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowAssetDeliveryMessageOutletComponent implements OnInit {
    @Input() integrator: NodeflowAssetNodeTemplateComponent;
    @Input() routeRelation: MessageConnectorsRouteRelationModel;
    @Input() socketConnectorRelation: SocketConnectorRelationModel;

    topicComponent: Type<any>;

    private producedInjector: Injector;

    constructor(@Inject(NODEFLOW_PROJECT1_EXTENSION_CONSUMER_TOPIC_COMPONENT_MAP) public topicComponentMap: { [identifier: string]: Type<any> },
                private viewContainer: ViewContainerRef) {
        this.initialize();
    }

    get consumerInjector(): Injector {
        return this.producedInjector;
    }

    ngOnInit() {
        this.produceCardInjector();
        this.topicComponent = this.topicComponentMap[this.routeRelation.message.topic] || NodeflowAssetDefaultConsumerComponent;
    }

    private produceCardInjector() {
        this.producedInjector = Injector.create({
            providers: [{
                provide: NODEFLOW_PROJECT1_CONSUMER_TOPIC_COMPONENT_RESOURCE_TOKEN,
                useValue: this.deriveChildCardInjectorValue()
            }],
            parent: this.viewContainer.injector
        });
    }

    // supplied state to each plugin
    private deriveChildCardInjectorValue(): NodeflowProject1ConsumerStateInjectable {
        return {
            message: this.routeRelation.message,
            socketConnectorRelation: this.socketConnectorRelation,
            integrator: this.integrator,
            nodeModel: this.integrator.cardAssemblyPlugin.viewModel.nodeModel
        };
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

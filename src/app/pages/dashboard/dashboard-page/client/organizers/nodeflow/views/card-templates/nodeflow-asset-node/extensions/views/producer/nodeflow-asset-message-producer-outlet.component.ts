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
import {
    NODEFLOW_PROJECT1_EXTENSION_PRODUCER_TOPIC_COMPONENT_MAP,
    NODEFLOW_PROJECT1_PRODUCER_TOPIC_COMPONENT_RESOURCE_TOKEN,
    NodeflowProject1ProducerStateInjectable
} from "../../../nodeflow-asset-node-token";
import { MessageModel } from "../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/message.model";
import { NodeflowAssetDefaultProducerComponent } from "./default/nodeflow-asset-default-producer.component";


@Component({
    selector: "nodeflow-asset-message-producer-outlet",
    template: "<ng-container *ngComponentOutlet=\"topicComponent; injector: producerInjector;\"></ng-container>",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowAssetMessageProducerOutletComponent implements OnInit {
    @Input() message: MessageModel;
    @Input() integrator: NodeflowAssetNodeTemplateComponent;

    topicComponent: Type<any>;

    private producedInjector: Injector;

    constructor(
        // @Inject(forwardRef(() => NodeflowAssetNodeTemplateComponent)) public integrator: NodeflowAssetNodeTemplateComponent,
        @Inject(NODEFLOW_PROJECT1_EXTENSION_PRODUCER_TOPIC_COMPONENT_MAP) public topicComponentMap: { [identifier: string]: Type<any> },
        private viewContainer: ViewContainerRef
    ) {
        this.initialize();
    }

    get producerInjector(): Injector {
        return this.producedInjector;
    }

    ngOnInit() {
        this.produceCardInjector();
        this.topicComponent = this.topicComponentMap[this.message.topic] || NodeflowAssetDefaultProducerComponent;
    }

    private produceCardInjector() {
        this.producedInjector = Injector.create({
            providers: [{
                provide: NODEFLOW_PROJECT1_PRODUCER_TOPIC_COMPONENT_RESOURCE_TOKEN,
                useValue: this.deriveChildCardInjectorValue()
            }],
            parent: this.viewContainer.injector
        });
    }

    // supplied state to each plugin
    private deriveChildCardInjectorValue(): NodeflowProject1ProducerStateInjectable {
        return {
            message: this.message,
            integrator: this.integrator,
            nodeModel: this.integrator.cardAssemblyPlugin.viewModel.nodeModel
        };
    }


    private initialize() {

    }
}

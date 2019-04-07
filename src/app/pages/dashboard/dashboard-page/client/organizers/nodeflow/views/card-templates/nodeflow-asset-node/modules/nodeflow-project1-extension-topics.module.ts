import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import {
    NODEFLOW_PROJECT1_EXTENSION_CONSUMER_TOPIC_COMPONENT_MAP,
    NODEFLOW_PROJECT1_EXTENSION_PRODUCER_TOPIC_COMPONENT_MAP
} from "../nodeflow-asset-node-token";
import { NodeflowAssetTopicsColorConsumerComponent } from "../extensions/topics/color/consumer/nodeflow-asset-topics-color-consumer.component";
import { NodeflowAssetDefaultConsumerComponent } from "../extensions/views/delivery/default/nodeflow-asset-default-consumer.component";
import { MessageModelStateDataIterablePipe } from "../pipes/message-model-state-data-iterable.pipe";
import { NodeflowAssetDefaultProducerComponent } from "../extensions/views/producer/default/nodeflow-asset-default-producer.component";
import { NodeflowAssetTopicsColorProducerComponent } from "../extensions/topics/color/producer/nodeflow-asset-topics-color-producer.component";


const componentList = [
    // coonsumer
    NodeflowAssetDefaultConsumerComponent,
    NodeflowAssetTopicsColorConsumerComponent,
    // producer
    NodeflowAssetDefaultProducerComponent,
    NodeflowAssetTopicsColorProducerComponent
];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    // compiler needs
    declarations: [
        MessageModelStateDataIterablePipe,
        ...componentList
    ],

    // dynamic injection
    entryComponents: [
        ...componentList
    ],

    providers: [

        // sample topic renderers
        {
            provide: NODEFLOW_PROJECT1_EXTENSION_CONSUMER_TOPIC_COMPONENT_MAP, useValue:
                {
                    "color": NodeflowAssetTopicsColorConsumerComponent
                }
        },

        {
            provide: NODEFLOW_PROJECT1_EXTENSION_PRODUCER_TOPIC_COMPONENT_MAP, useValue:
                {
                   "color": NodeflowAssetTopicsColorProducerComponent
                }
        }


    ]

})
export class NodeflowProject1ExtensionTopicsModule {
}


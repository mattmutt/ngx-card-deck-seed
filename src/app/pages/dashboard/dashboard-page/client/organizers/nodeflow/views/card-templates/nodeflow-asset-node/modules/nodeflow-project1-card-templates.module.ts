import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { ExtractSocketConnectorRelationListByStateTypePipe } from "../pipes/extract-socket-connector-relation-list-by-state-type.pipe";
import { NodeflowAssetNodeTemplateComponent } from "../nodeflow-asset-node-template.component";
import { NodeflowSocketConnectorTypePipe } from "../pipes/nodeflow-socket-connector-type.pipe";
import { NodeflowMessageModelStateDataTuplesPipe } from "../pipes/nodeflow-message-model-state-data-tuples.pipe";
import { NodeflowMessageConnectorsRouteRelationBySocketFilterPipe } from "../pipes/nodeflow-message-connectors-route-relation-by-socket-filter.pipe";
import { NodeflowMessageModelHasStatePipe } from "../pipes/nodeflow-message-model-has-state.pipe";
import { NodeSocketListBySocketConnectorRelationAsyncPipe } from "../pipes/node-socket-list-by-socket-connector-relation-async.pipe";
import { NodeflowAssetMessagesConsumerCollectionComponent } from "../extensions/views/consumer/nodeflow-asset-messages-consumer-collection.component";
import { NodeflowAssetMessagesProducerCollectionComponent } from "../extensions/views/producer/nodeflow-asset-messages-producer-collection.component";
import { ExtractSocketConnectorRelationListBySocketPipe } from "../pipes/extract-socket-connector-relation-list-by-socket.pipe";
import { NodeflowAssetDeliveryMessageOutletComponent } from "../extensions/views/delivery/nodeflow-asset-delivery-message-outlet.component";
import { NodeflowProject1ExtensionTopicsModule } from "./nodeflow-project1-extension-topics.module";
import { NodeflowAssetMessageProducerOutletComponent } from "../extensions/views/producer/nodeflow-asset-message-producer-outlet.component";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NodeflowProject1ExtensionTopicsModule // samples for topic renderers
    ],
    // compiler needs
    declarations: [
        NodeflowAssetNodeTemplateComponent,
        NodeflowAssetMessagesConsumerCollectionComponent,
        NodeflowAssetMessagesProducerCollectionComponent,
        NodeflowAssetDeliveryMessageOutletComponent,
        NodeflowAssetMessageProducerOutletComponent,
        NodeflowSocketConnectorTypePipe,
        NodeflowMessageModelStateDataTuplesPipe,
        NodeflowMessageModelHasStatePipe,
        NodeflowMessageConnectorsRouteRelationBySocketFilterPipe,
        NodeSocketListBySocketConnectorRelationAsyncPipe,
        ExtractSocketConnectorRelationListByStateTypePipe,
        ExtractSocketConnectorRelationListBySocketPipe
    ],

    // dynamic injection
    entryComponents: [
        NodeflowAssetNodeTemplateComponent
    ],

    providers: []

})
export class NodeflowProject1CardTemplatesModule {
}


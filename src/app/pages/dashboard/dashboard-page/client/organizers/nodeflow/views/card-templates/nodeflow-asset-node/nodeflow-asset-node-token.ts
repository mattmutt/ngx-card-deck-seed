import { InjectionToken, Type } from "@angular/core";
import { MessageModel } from "../../../../../../../studio/nodeflow-studio-compositor/state/model/message.model";
import { SocketConnectorRelationModel } from "../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { NodeflowAssetNodeTemplateComponent } from "./nodeflow-asset-node-template.component";
import { NodeModel } from "../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";

export interface NodeflowProject1ConsumerStateInjectable {
    nodeModel: NodeModel;
    message: MessageModel;
    socketConnectorRelation: SocketConnectorRelationModel;
    integrator: NodeflowAssetNodeTemplateComponent; // parent view component
}

export interface NodeflowProject1ProducerStateInjectable {
    nodeModel: NodeModel;
    message: MessageModel;
    integrator: NodeflowAssetNodeTemplateComponent; // parent view component
}


export const NODEFLOW_PROJECT1_CONSUMER_TOPIC_COMPONENT_RESOURCE_TOKEN = new InjectionToken<NodeflowProject1ConsumerStateInjectable>('project 1 Topic Consumer Component State');
export const NODEFLOW_PROJECT1_PRODUCER_TOPIC_COMPONENT_RESOURCE_TOKEN = new InjectionToken<NodeflowProject1ProducerStateInjectable>('project 1 Topic Producer Component State');

export const NODEFLOW_PROJECT1_EXTENSION_CONSUMER_TOPIC_COMPONENT_MAP = new InjectionToken<{ [identifier: string]: Type<any> }>("project1 extension consumer topic component");
export const NODEFLOW_PROJECT1_EXTENSION_PRODUCER_TOPIC_COMPONENT_MAP = new InjectionToken<{ [identifier: string]: Type<any> }>("project1 extension producer topic component");

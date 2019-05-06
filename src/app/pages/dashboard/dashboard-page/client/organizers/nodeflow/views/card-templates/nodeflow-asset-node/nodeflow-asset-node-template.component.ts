import { Component, ElementRef, forwardRef, Inject, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { demoDashboardVendorClassificationMap } from "../../../../../../integration/card-outlet/demo-dashboard-vendor-classification.class";
import { NodeflowAssetNodeComponent } from "../../card-assembly-plugins/asset-node/nodeflow-asset-node.component";
import { StandardCardPluginTemplateBase } from "../../../../../common/standard/card-outlet/card-assembly-plugins/base/standard-card-plugin-template-base";
import {
    DashboardCardTemplatableClassMetadata,
    TemplateCreatorOrganization,
    TemplateViewClassification
} from "ngx-card-deck";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import { CardResourceInjectionTokenValue } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";
import {
    SocketConnectorType,
    SocketModel,
    SocketViewModelInteractionSelectingState
} from "../../../../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { NodeModel } from "../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { SimulatorProducerFormViewProvider } from "./extensions/forms/simulator-producer-form-view.provider";
import { SocketConnectorRelationStateType } from "../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { MessageModel } from "../../../../../../../studio/nodeflow-studio-compositor/state/model/message.model";
import { NodeSegmentInteractionMessagingState } from "../../../../../../../studio/nodeflow-studio-compositor/state/model/compositor.interface";
import { SimulatorConsumerFormViewProvider } from "./extensions/forms/simulator-consumer-form-view.provider";
import { SimulatorFormViewBase } from "./extensions/forms/simulator-form-view-base.class";

// the status correlates to a colored stripe on the left side of card
enum NodeflowAssetNodeModelStatusType {
    unknown = 0, invalid, valid, busy
}

const resources = {

    layout: {
        // define the correct color for card's indicator bar on left edge
        statusIndicatorClass: {
            [NodeflowAssetNodeModelStatusType.unknown]: "statusFlag-unknown",
            [NodeflowAssetNodeModelStatusType.invalid]: "statusFlag-invalid",
            [NodeflowAssetNodeModelStatusType.valid]: "statusFlag-valid",
            [NodeflowAssetNodeModelStatusType.busy]: "statusFlag-busy"
        }

    },

    types: {
        socketConnectorTypeMap: new Map([
            ["input", SocketConnectorType.input],
            ["output", SocketConnectorType.output]
        ]) as Map<string, SocketConnectorType>,
        socketConnectorTypeList: [] as Array<[string, SocketConnectorType]>,
        socketConnectorTypeEnum: SocketConnectorType
    }

};


@Component({
    templateUrl: 'nodeflow-asset-node-template.html',
    viewProviders: [SimulatorProducerFormViewProvider, SimulatorConsumerFormViewProvider],
})
export class NodeflowAssetNodeTemplateComponent extends StandardCardPluginTemplateBase implements OnInit, OnDestroy {
    // annotation stamped at class level
    static classification: DashboardCardTemplatableClassMetadata = {
        organization: new TemplateCreatorOrganization(demoDashboardVendorClassificationMap.nodeflow_sample, "nodeflow presentation template")
    };


    // model constraints on select form fields
    types = resources.types;

    // subviews state
    viewState = {
        detailsPane: {visible: true}, // debug: node state details revealed
        socketCollectionPane: {visible: false},
        messagesFormCollectionPane: {visible: false},
        messagesConsumerCollectionPane: {visible: false}
    };

    currentStatus: NodeflowAssetNodeModelStatusType = NodeflowAssetNodeModelStatusType.unknown;

    constructor(// interface token conformance requirement
        @Inject(forwardRef(() => CARD_RESOURCE_TOKEN)) public resourceToken: CardResourceInjectionTokenValue,
        @Inject(NodeflowAssetNodeComponent) public cardAssemblyPlugin: NodeflowAssetNodeComponent<any, any, any, any>,
        public simulatorProducerFormView: SimulatorProducerFormViewProvider,
        public simulatorConsumerFormView: SimulatorConsumerFormViewProvider,
        _dashboardComponent: DashboardComponent,
        _globalState: GlobalStateBase,
        _renderer: Renderer2,
        _element: ElementRef,
    ) {
        super(resourceToken, cardAssemblyPlugin, _dashboardComponent, _globalState, _element);

        this.templateOrganization = NodeflowAssetNodeTemplateComponent.classification.organization;
        this.viewClassification = new TemplateViewClassification("presentation", "node presentational code");

        /*
        // DEBUG
        if (this.resourceToken.card.resourceId === "message-layout-4") {
            console.log("debug visible");
            this.viewState.messagesFormCollectionPane.visible = true;
        }

        if (this.resourceToken.card.resourceId === "machine-learning-1") {
            console.log("debug visible");
            this.viewState.messagesConsumerCollectionPane.visible = true;
        }

        if (this.resourceToken.card.resourceId === "temperature-monitor") {
            console.log("debug visible");
            this.viewState.messagesConsumerCollectionPane.visible = true;
        }

        if (this.resourceToken.card.resourceId === "message-layout-5") {
            console.log("debug visible");
            this.viewState.messagesFormCollectionPane.visible = true;
        }
        */


    }


    // ~~~~~~~~~~ user interaction ~~~~~~~~~~~~~

    ngOnInit() {
        super.ngOnInit();
        this.initialize();
    }

    /*
    remember to call back to base class
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    */

    // -------- user interaction ------------
    onToggleViewPane(viewStateItemRef: { visible: boolean }) {
        viewStateItemRef.visible = !viewStateItemRef.visible;
    }

// classifies node socket status and traffic direction
    styleNodeSocketClasses(socket: SocketModel, nodeModel: NodeModel): object {
        return {
            nodeSocketConsumer: socket.type === SocketConnectorType.input,
            nodeSocketProducer: socket.type === SocketConnectorType.output,
            nodeSocketDisabled: !socket.enabled, // shutdown port
            nodeSocketEmpty: !this.cardAssemblyPlugin.viewModel.messageConnectivityDelegate.isSocketConnected(socket),
            nodeSocketFocusedAction: socket.view.state.interaction.selecting === SocketViewModelInteractionSelectingState.focused
        };
    }


    // triggers a visual view update on the compositor component according to `NodeflowCompositorViewUpdatable` contract
    onTogglePreviewSocketConnectorRelationList(routeRelation: MessageConnectorsRouteRelationModel, messageModel: MessageModel, linkStateType: SocketConnectorRelationStateType | null, isShowing = true) {
        // union of Set or Array
        const filteredSocketConnectorsList = linkStateType !== null ? routeRelation.getSocketConnectorRelationListByStateType(linkStateType) : Array.from(routeRelation.connectors);
        filteredSocketConnectorsList.forEach((scr) => this.cardAssemblyPlugin.viewModel.compositor.onSocketConnectorRelationBeforeMovingStateChangeEvent(scr, isShowing));
    }

    // trigger brief preview of the socket while hovering
    onTogglePreviewSocket(targetSocket: SocketModel, isShowing = true) {
        this.cardAssemblyPlugin.viewModel.compositor.onSocketViewSelectingStateChangeEvent(targetSocket, isShowing);
    }

    // create a visual sequence that simulates a message transmission lifecycle across a route relation having 1 or more connectors
    onAnimateSubmitSocketConnectorRelationList(routeRelation: MessageConnectorsRouteRelationModel, messageModel: MessageModel, linkStateType: SocketConnectorRelationStateType | null) {

        const filteredSocketConnectorsList = linkStateType !== null ? routeRelation.getSocketConnectorRelationListByStateType(linkStateType) : Array.from(routeRelation.connectors);
        const updateBundledSocketConnectors = (transitionStateType: NodeSegmentInteractionMessagingState, preserveCurrentState: boolean) => {
            filteredSocketConnectorsList.forEach((scr) => {
                this.cardAssemblyPlugin.viewModel.compositor.onSocketConnectorRelationMessagingStateChangeEvent(scr, transitionStateType);
            });
        };

        const animationStates: Array<[number, NodeSegmentInteractionMessagingState, boolean]> = [
            [0, NodeSegmentInteractionMessagingState.none, false],
            [50, NodeSegmentInteractionMessagingState.connect, false],
            [100, NodeSegmentInteractionMessagingState.transmit, false],
            [900, NodeSegmentInteractionMessagingState.none, true] // reset
        ];

        animationStates.forEach((transitionDirective) => {
            setTimeout(() => {
                updateBundledSocketConnectors(transitionDirective[1], transitionDirective[2]);
            }, transitionDirective[0]);
        });

        // stop preview and transition to animating the delivery of a message over directed connectors in a filters bundle route relation
        this.onTogglePreviewSocketConnectorRelationList(routeRelation, messageModel, linkStateType, false);
    }


    // toggle presentation on
    private updateStatusIndicatorClass(status: NodeflowAssetNodeModelStatusType) {
        this.resourceToken.outlet.activateEnumeratedClass(this.cardAssemblyPlugin.resourceToken.outlet.cardElement, status, resources.layout.statusIndicatorClass);
    }

    private initialize() {
        // examine card for node data

        // template iterable requirement
        this.types.socketConnectorTypeList = Array.from(this.types.socketConnectorTypeMap);

        // load the generator form platform for modeling the message
        this.templateSubscriptionList.push(
            this.cardAssemblyPlugin.onCompositorNodeChange$.subscribe((nodeModel) => {
                // provision data transfer and delivery form views
                ([this.simulatorProducerFormView, this.simulatorConsumerFormView] as Array<SimulatorFormViewBase>)
                    .map((directedMessageFormView) => {
                        directedMessageFormView.setMessageConnectivityDelegate(this.cardAssemblyPlugin.viewModel.messageConnectivityDelegate);
                        directedMessageFormView.createViewForm(nodeModel);
                    });
            })
        );

        // mark template as compact when RWD breakpoint less than reasonable size
        this.templateSubscriptionList.push(
            this.cardAssemblyPlugin.onCardDimensionCompactViewChange$.subscribe((isTinyCardSize) => {
                if (isTinyCardSize) {
                    this.viewState.detailsPane.visible = false;
                } else {
                    // may enforce?
                    this.viewState.detailsPane.visible = true;
                }
            })
        );


        // demonstration
        const sampleStateList = [NodeflowAssetNodeModelStatusType.unknown, NodeflowAssetNodeModelStatusType.invalid, NodeflowAssetNodeModelStatusType.valid, NodeflowAssetNodeModelStatusType.busy];
        // tslint:disable-next-line:no-bitwise
        this.currentStatus = sampleStateList[(Math.random() * sampleStateList.length) >> 0];
        this.updateStatusIndicatorClass(this.currentStatus);
    }
}

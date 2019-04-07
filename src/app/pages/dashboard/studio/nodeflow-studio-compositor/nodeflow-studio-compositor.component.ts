import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Host,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import { DemoDashboardPageComponent } from "../../dashboard-page/demo-dashboard-page.component";
import {
    NodeSegmentInteractionMessagingState,
    NodeSegmentInteractionMovingState
} from "./state/model/compositor.interface";
import { NodeflowStudioConnectorGeometryService } from "./nodeflow-studio-connector-geometry.service";
import { NodeflowStudioCanvasLayoutService } from "./nodeflow-studio-canvas-layout.service";
import { takeUntil } from "rxjs/operators";
import { Subscription } from "rxjs";
import { NodeflowStudioShapeGeometryService } from "./nodeflow-studio-shape-geometry.service";
import { NodeflowStudioGridStateManagerService } from "./nodeflow-studio-grid-state-manager.service";
import {
    SocketConnectorRelationModel,
    SocketConnectorRelationStateType
} from "./state/model/relation/socket-connector-relation.model";
import { SocketConnectorType, SocketModel, SocketViewModelInteractionSelectingState } from "./state/model/socket.model";
import { CardSubjectsParseValidatorManager } from "./state/model/collection/card-node-validator-subjects.model";
import { NodeModel } from "./state/model/node.model";
import { NodeflowStudioCardParseNotificationOverlayService } from "./nodeflow-studio-card-parse-notification-overlay.service";
import {
    ContentProjectionProxyCommand,
    ContentProjectionProxyReplacerType
} from "./views/overlays/nodeflow-studio-overlay-template.interface";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { NodeflowStudioSocketConnectorTooltipOverlayService } from "./nodeflow-studio-socket-connector-tooltip-overlay.service";
import { NodeflowStudioSocketConnectorDragService } from "./nodeflow-studio-socket-connector-drag.service";
import { ViewAssemblyTypeStateResourceLayoutItemSchema } from "ngx-card-deck";
import { GridContainerDashboardContainerComponent } from "ngx-card-deck";
import { BrowserUserAgentService } from "./utils/browser/browser-user-agent.service";
import { NodeflowAssetNodeComponent } from "../../dashboard-page/client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.component";
import { NodeflowCompositorViewUpdatable } from "./nodeflow-studio.interface";

@Component({
    selector: 'nodeflow-studio-compositor',
    templateUrl: './nodeflow-studio-compositor.html',
    styleUrls: ['./nodeflow-studio-compositor.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowStudioCompositorComponent implements NodeflowCompositorViewUpdatable, OnInit, AfterViewInit, OnDestroy {


    // @Input() overlayTemplate: TemplateRef<any>;

    // triggered menu
    @ViewChild("gridItemMenuOverlayTemplate") public gridItemMenuOverlayTemplate: TemplateRef<any>;
    @ViewChild("segmentConnectorMenuOverlayTemplate") public segmentConnectorMenuOverlayTemplate: TemplateRef<any>;
    // toggles menu and projects back to the "overlayMenuContainer" section, from demo-dashboard-page template
    visibleOverlayTemplate: TemplateRef<any> | undefined; // projected in dashboard-container-grid-widget-overlay


    // triggered tooltip
    @ViewChild("socketConnectorTooltipTemplate") socketConnectorTooltipTemplate: TemplateRef<any>;
    visibleTooltipTemplate: TemplateRef<any> | undefined; // projected in dashboard-container-grid-widget-overlay
    // tooltip context
    visibleTooltipContext = {
        socket: undefined as any as SocketModel,
        node: undefined as any as NodeModel,
        triggerElement: undefined as any as HTMLElement
    };


    // error notifications
    @ViewChild("canvasCardParseErrorOverlayTemplate") canvasCardParseErrorOverlayTemplate: TemplateRef<any>;
    visibleNotificationTemplate: TemplateRef<any> | undefined; // projected in dashboard-container-grid-widget-overlay
    // notification scoping context
    visibleNotificationContext = {
        messages: undefined as any as Array<string>,
        overlayCommand: undefined as any as ContentProjectionProxyCommand
    };


    // scaling factor
    @Input() zoomLevel: number;

    @ViewChild("svgCanvasHandle") svgCanvasHandle: ElementRef; // reference starting SVG tag
    @ViewChild("svgCanvasTransformerGroup") svgCanvasTransformerGroup: ElementRef; // relates and synchronizes pan/zoom

    nodeValidatorResultManager: CardSubjectsParseValidatorManager;
    private dashboardPageComponentSubscriptionList: Array<Subscription>;
    private routerSub: Subscription;


    // get elementBoundingClientRect(): ClientRect { return this.element.nativeElement.getBoundingClientRect(); }

    constructor(@Host() @Inject(forwardRef(() => DemoDashboardPageComponent)) public pageComponent: DemoDashboardPageComponent,
                public shapeLibrary: NodeflowStudioShapeGeometryService,
                public gridStateManager: NodeflowStudioGridStateManagerService,
                private browserService: BrowserUserAgentService,
                private connectorGeometryService: NodeflowStudioConnectorGeometryService,
                private cardParseNotificationOverlayService: NodeflowStudioCardParseNotificationOverlayService,
                private socketConnectorTooltipOverlayService: NodeflowStudioSocketConnectorTooltipOverlayService,
                private canvasLayoutService: NodeflowStudioCanvasLayoutService,
                private socketConnectorDragService: NodeflowStudioSocketConnectorDragService,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private element: ElementRef,
                private vcr: ViewContainerRef,
                private renderer: Renderer2,
                private zone: NgZone,
                private cdr: ChangeDetectorRef) {


        // when switching routes to similar dashboards, the component is retained in memory
        this.routerSub = this.router.events.subscribe((evt) => {
            if (evt instanceof NavigationEnd) {
                this.cleanup();
                // re-init after a route transition, recall component lifecycle trigged onInit once
                this.initialize();
            }
            if (evt) {
                //this.initialize();
            }


        });


    }

    /**
     * drawing canvas layer need to calculate its allocated width on the basis of the gridster
     */
    get calculatedLayoutWidth(): number {
        return this.canvasLayoutService.calculateWidth();
    }

    /**
     * drawing canvas layer need to calculate its allocated width on the basis of the gridster
     */
    get calculatedLayoutHeight(): number {
        return this.canvasLayoutService.calculateHeight();
    }

    // lambda for preserving proxy for template projection
    projectContentTemplateProxy: ContentProjectionProxyReplacerType = (outletTemplateRefName: string, contentTemplate: TemplateRef<any>, templateBoundContext: object, replacementPropertiesMap: object) => {
        this[outletTemplateRefName] = contentTemplate;
        // define/replace template bound properties
        Object.keys(replacementPropertiesMap).forEach((key) => {
            templateBoundContext[key] = replacementPropertiesMap[key];
        });

        // command pattern for negotiating close behavior
        const command: ContentProjectionProxyCommand = {
            onLayout: () => this.relayout(),

            close: () => {
                this[outletTemplateRefName] = undefined;
                Object.keys(replacementPropertiesMap).forEach((key) => {
                    templateBoundContext[key] = undefined;
                });
                this.relayout();

                return true;
            }
        };

        templateBoundContext["overlayCommand"] = command; // standard interface
        return command;
    };


    /**
     * not triggered when switching to other dashboard views
     */
    ngOnInit() {
        this.initialize();
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        this.routerSub.unsubscribe();
        this.cleanup();
    }

    /**
     * user interaction events
     */

    onConnectorRelationArrowClickEvent(relation: SocketConnectorRelationModel) {
        this.removeConnectorRelation(relation);
        this.relayout();
    }

    onConnectorRelationArrowMouseEnterEvent(relation: SocketConnectorRelationModel, evt: MouseEvent) {
        // console.log("over arrow", relation);
    }

    onConnectorRelationArrowMouseLeaveEvent(relation: SocketConnectorRelationModel, evt: MouseEvent) {
        // console.log("leave arrow", relation);
    }

    // simulate starting a drag event
    onSocketConnectorDragStartEvent(socket: SocketModel, relation: SocketConnectorRelationModel, evt: MouseEvent) {
        // drag helper
    }

    // reveal tooltip
    onSocketConnectorMouseEnterEvent(socket: SocketModel, nodeModel: NodeModel, evt: MouseEvent) {
        this.socketConnectorTooltipOverlayService.show(socket, nodeModel, evt.target);
    }

    // when user toggles modes of the socket receptor
    // demo to alter line state
    /*
    onSocketConnectorClickEvent(socket: SocketModel, relation: SocketConnectorRelationModel) {
        const stateInteraction = relation.view.nodeSegmentConnector.state.interaction;

        switch (stateInteraction.moving) {
            case NodeSegmentInteractionMovingState.none:
                // state transition to before
                stateInteraction.moving = NodeSegmentInteractionMovingState.before;
                break;

            case NodeSegmentInteractionMovingState.before:
                // state transition to default - none
                stateInteraction.moving = NodeSegmentInteractionMovingState.none;
                break;

            default:
        }

        console.log("acted upon", socket.view.nodeSegmentCoordinate);
        this.relayout();
    }
    */

    // hide tooltip
    onSocketConnectorMouseLeaveEvent(socket: SocketModel, nodeModel: NodeModel, evt: MouseEvent) {
        this.socketConnectorTooltipOverlayService.hide();
    }

    // segment link
    onConnectorRelationPathClickEvent(relation: SocketConnectorRelationModel) {
        // click link path
    }

    filterScalarPoint(point: number, isScaled = true): number {
        return this.canvasLayoutService.filterScalarPoint(point, isScaled);
    }

    /**
     * Tracking for the link
     *
     */
    trackConnectorBy(index: number, iterator: SocketConnectorRelationModel): string {
        return iterator.id!;
    }

    // when traversing over node models
    trackNodeBy(index: number, iterator: NodeModel): string {
        return iterator.id;
    }

    // when traversing over sockets
    trackSocketBy(index: number, iterator: SocketModel): string {
        return iterator.id;
    }

    // gridster inset whitespacing
    deriveViewportOffsetTransform(): string | undefined {
        if (this.pageComponent.gridContainerAssemblyInstance) {
            const offsetPadding = this.pageComponent.gridContainerAssemblyInstance.assemblyConfiguration.materializedModel.gridsterConfiguration.margin!;
            return this.canvasLayoutService.generateSVGTransformSpace(offsetPadding, offsetPadding, this.zoomLevel);
        }
        return;
    }


    // toggle view when hovering over menu selection
    onSocketViewSelectingStateChangeEvent(socket: SocketModel, show: boolean) {

        socket.view.state.interaction.selecting = show
            ? SocketViewModelInteractionSelectingState.focused
            : SocketViewModelInteractionSelectingState.none;

        this.relayout();
    }

    // adjusts the "before moving" state ( link highlight preview) of a single connector path
    // effect is a glowing path with established sockets lit up
    onSocketConnectorRelationBeforeMovingStateChangeEvent(targetConnectorRelation: SocketConnectorRelationModel, showFlag: boolean) {
        if (targetConnectorRelation) {
            targetConnectorRelation.view.nodeSegmentConnector.state.interaction.moving = showFlag
                ? NodeSegmentInteractionMovingState.before // visuals
                : NodeSegmentInteractionMovingState.none;

            targetConnectorRelation.getLinkedSocketList()
                .forEach((socket) => this.onSocketViewSelectingStateChangeEvent(socket, showFlag));
        }

        this.relayout();
    }

    // animate a packet delivery over the socket connector path
    onSocketConnectorRelationMessagingStateChangeEvent(targetConnectorRelation: SocketConnectorRelationModel, transitionState: NodeSegmentInteractionMessagingState) {
        targetConnectorRelation.view.nodeSegmentConnector.state.interaction.messaging = transitionState;

        this.relayout();
    }


    // classifies node socket status and traffic direction
    styleNodeSocketClasses(socket: SocketModel, socketLinkedNode: NodeModel): any {

        return {
            nodeSocketConsumer: socket.type === SocketConnectorType.input,
            nodeSocketProducer: socket.type === SocketConnectorType.output,
            nodeSocketDisabled: !socket.enabled, // shutdown port
            nodeSocketEmpty: !this.gridStateManager.routes.isSocketConnected(socket),
            nodeSocketFocusedAction: socket.view.state.interaction.selecting === SocketViewModelInteractionSelectingState.focused
        };
    }

    // class mapping for connector state transitions during user interaction
    styleConnectorRelationClasses(relation: SocketConnectorRelationModel): any {
        const connector = relation.view.nodeSegmentConnector;

        return {
            // messaging delivery lifecycle type
            "messaging-none": connector.state.interaction.messaging === NodeSegmentInteractionMessagingState.none,
            "messaging-connect": connector.state.interaction.messaging === NodeSegmentInteractionMessagingState.connect,
            "messaging-transmit": connector.state.interaction.messaging === NodeSegmentInteractionMessagingState.transmit,
            "messaging-error": connector.state.interaction.messaging === NodeSegmentInteractionMessagingState.error,

            // moving
            "moving-inactive": connector.state.interaction.moving === NodeSegmentInteractionMovingState.none,
            "moving-before": connector.state.interaction.moving === NodeSegmentInteractionMovingState.before,
            "moving-active": connector.state.interaction.moving === NodeSegmentInteractionMovingState.active,
            "moving-after": connector.state.interaction.moving === NodeSegmentInteractionMovingState.after,

            // validation
            "link-valid": relation.state === SocketConnectorRelationStateType.valid, // ports on both ends verified for availability ( by backend )
            "link-invalid": relation.state === SocketConnectorRelationStateType.invalid, // either or both ports are incapable of pass/receiving the message
            "link-unknown": relation.state === SocketConnectorRelationStateType.unknown // indeterminate status for the time-being. only server can judge

        };
    }

    // established socket connected to a port
    drawNodeSocketPath(socket: SocketModel, node: NodeModel, sequence: number, collectionSize: number): string {
        return this.shapeLibrary.drawNodeSocketPathGeometry(socket, node, sequence, collectionSize);
    }

    // safer update view
    public updateViewTransition() {
        this.triggerLayoutRender();
        this.updateViewUntil(this.pageComponent.gridContainerAssemblyInstance.transitionDuration + 10);
    }

    // regularly updated view update
    // external clients that add/delete nodes must trigger
    private triggerLayoutRender() {

        // explicit since computations above are done out of zone
        // needed since callers are wrapping rAF?
        this.gridStateManager.recalculateConnectorsView();
        this.relayout();
    }


    private initialize() {
        // setup grid gridsterItemList and connectors as they initialize
        this.dashboardPageComponentSubscriptionList = [

            this.pageComponent.gridContainerAssemblyInstanceInitialize$.subscribe((value) => this.onCompositorGridContainerCreated(value)),

            // accept declarative initializations until grid initializes. Thereafter restricted to imperative
            this.pageComponent.layoutItemInitialize$
                .pipe(takeUntil(this.pageComponent.gridLayoutItemsInitialize$))
                .subscribe((layoutItem) => this.createLayoutItemModel(layoutItem)),

            this.pageComponent.gridLayoutItemsInitialize$.subscribe((value) => this.createSegmentConnectors(value)),
            this.pageComponent.gridLayoutItemsChangeList$.subscribe((value) => this.onGridLayoutItemsChangeList(value)),

            // external model influence change detection, sync layout - else arrow direction is backwards after zooming
            this.pageComponent.zoomLevelChangeTransitionEnd$.subscribe(() => this.relayout()),

        ];

        // provide template delegate to overlays
        this.cardParseNotificationOverlayService.initialize(this.projectContentTemplateProxy, this.canvasCardParseErrorOverlayTemplate, this.visibleNotificationContext);
        this.socketConnectorTooltipOverlayService.initialize(this.projectContentTemplateProxy, this.socketConnectorTooltipTemplate, this.visibleTooltipContext);

    }


    /**
     * router doesn't trigger `ngOnInit` by spec when switching dashboard routes
     */
    private onCompositorGridContainerCreated(gridContainerAssembly: GridContainerDashboardContainerComponent) {
        this.gridStateManager.initializeStore();

        this.connectorGeometryService.setGridWidget(gridContainerAssembly.gridWidget);
        this.connectorGeometryService.setGridContainerAssembly(gridContainerAssembly);
        this.canvasLayoutService.setGridWidget(gridContainerAssembly.gridWidget);

        // after grid delivered, await drag interactions
        this.prepareGridLayoutDragStateListeners();
    }

    private onGridLayoutItemsChangeList(itemsChangeList: Array<ViewAssemblyTypeStateResourceLayoutItemSchema>) {
        // this.updateViewUntil(this.pageComponent.gridContainerAssemblyTransitionDuration);
    }

    // short term update loops on line drawing, should not be on active for long
    // should the duration to wait be 0, just run once
    private updateViewUntil(duration: number) {

        const reentrantViewUpdater = (startTimestamp: number, timestamp: number, durationWait: number = 0) => {
            const runtime = timestamp - startTimestamp;
            if (runtime < durationWait || !durationWait) {
                this.triggerLayoutRender();
                window.requestAnimationFrame((ts: number) => reentrantViewUpdater(startTimestamp, ts, durationWait));
            }
        };

        window.requestAnimationFrame((timestamp) => {
            reentrantViewUpdater(timestamp, timestamp, duration);
        });
    }

    // runs through until cancelled
    private updateViewWhile(canceller: { status: boolean }): number {

        const reentrantViewUpdater = (startTimestamp: number, timestamp: number, iteration: number) => {
            // const runtime = timestamp - startTimestamp;
            if (!canceller.status) { // until signalled to halt
                this.triggerLayoutRender();
                window.requestAnimationFrame((ts: number) => reentrantViewUpdater(startTimestamp, ts, iteration + 1));
            }
        };

        const animTask = window.requestAnimationFrame((timestamp) => {
            reentrantViewUpdater(timestamp, timestamp, 0);
        });

        return animTask;
    }

    private createLayoutItemModel(layoutItem: ViewAssemblyTypeStateResourceLayoutItemSchema) {

        const gridsterItemFindMatch = this.connectorGeometryService.findGridsterItemComponent(layoutItem);

        if (gridsterItemFindMatch) {
            this.gridStateManager.importGridsterItem(gridsterItemFindMatch);
        } else {
            // error: unmatched gridster item
            console.error("unmatched grid item at coordinate space", layoutItem.layout);
        }
    }


    /**
     * when grid has initialized all layout GridsterItemList, establish visual many-to-many connector linkages
     */
    private createSegmentConnectors(layoutItemList: Array<ViewAssemblyTypeStateResourceLayoutItemSchema>) {

        // retain conflicts and parsing errors during hydration phase of nodes from serialized state
        this.nodeValidatorResultManager = this.gridStateManager.assembleLayoutConnectors(layoutItemList);
        this.prepareCanvasTransitionDuration();


        // await for models to build, one frame later sockets will have the condensing rules set
        requestAnimationFrame(() => {
            this.triggerLayoutRender();
        });

        // initial injection of compositor node into the actual card outlet's plugin assembly <DashboardCardPluggable>
        const nodeLinkJobResultCount = layoutItemList
            .map((layoutItem) => +this.assignNodeModelToCardAssemblyPlugin(layoutItem))
            .reduce((acc, currentValue) => acc + currentValue, 0);

        // note failures
        if (nodeLinkJobResultCount < layoutItemList.length) {
            console.error("could not link compositor nodes to plugins via mappings", layoutItemList.length - nodeLinkJobResultCount);
        }

        // notify of any validation failure as warnings since not serious
        this.cardParseNotificationOverlayService.process(this.nodeValidatorResultManager);

    }


    // set node model directly on linked card plugin
    private assignNodeModelToCardAssemblyPlugin(layoutItem: ViewAssemblyTypeStateResourceLayoutItemSchema): boolean {
        const messageConnectivityMgr = this.gridStateManager.routes;
        const node = this.gridStateManager.findNodeById(layoutItem.resourceId);
        if (!node) {
            return false;
        }

        // presumed to be AssetNode
        const cardPlugin = this.pageComponent.gridContainerAssemblyInstance.cardAssemblyPluginList.find((plugin) => plugin.resourceToken.card.resourceId === layoutItem.resourceId) as NodeflowAssetNodeComponent<any, any, any, any>;
        if (!cardPlugin) {
            return false;
        }
        // Bridges the compositor view component along with the state of the nodes, sockets and connectors -> plugin
        // injects unified relevant node mode, sockets and connectors. Establishes view model context vital for triggering UI updates
        cardPlugin.attachViewModel({
            compositor: this,
            nodeModel: node,
            messageConnectivityDelegate: messageConnectivityMgr,
            // change detecting streams
            onNodeCollectionChange$: this.gridStateManager.nodeCollectionChange$,
            // change detection on relations owned by the node
            onNodeConsumerRelationsChange$: messageConnectivityMgr.streamMessageConnectorsRouteRelationCollectionChangeByNode$(node, SocketConnectorType.input),
            onNodeProducerRelationsChange$: messageConnectivityMgr.streamMessageConnectorsRouteRelationCollectionChangeByNode$(node, SocketConnectorType.output),

            // monitor socket changes
            onNodeConsumerSocketConnectorRelationModelChange$: messageConnectivityMgr.streamSocketConnectorRelationModelChangeByNode$(node, SocketConnectorType.input),
            onNodeProducerSocketConnectorRelationModelChange$: messageConnectivityMgr.streamSocketConnectorRelationModelChangeByNode$(node, SocketConnectorType.output)
        });


        // compositor to react whenever card plugin mutates something in model
        cardPlugin.resourceToken.outlet.provisionMessageDeliveryTopic(cardPlugin.outletMessageDeliveryTopicMap.onLayoutChange).subscribe(
            (de) => {
                this.relayout();
            },
            () => {
            },
            () => {
                // provisioning stream teardown
            }
        );


        return true;
    }

    // ~~~~~~~~~~~~~~~ Connector Utilities ~~~~~~~~~~~

    /**
     * synchronizes the essential timings for consistent experience while panning, zooming
     */
    private prepareCanvasTransitionDuration() {

        setTimeout(() => {
            const duration = this.pageComponent.gridContainerAssemblyInstance.transitionDuration;
            this.renderer.setStyle(this.svgCanvasHandle.nativeElement, "transition", `width ${duration}ms, height ${duration}ms`);
            this.renderer.setStyle(this.svgCanvasTransformerGroup.nativeElement, "transition", `transform ${duration}ms`);

        }, 0);


        // Microsoft browser lags during first rendering, additional relayout jobs
        if (this.browserService.isMicrosoftBrowser()) {
            const paintCycles = 10;
            for (let i = 0; i < paintCycles; i++) {
                setTimeout(() => {
                    this.triggerLayoutRender();
                }, this.pageComponent.gridContainerAssemblyInstance.transitionDuration * ((i + 1) / paintCycles));
            }
        }


    }


    // reacts to interaction of dragging or movement around on the grid via pair of streams
    private prepareGridLayoutDragStateListeners() {

        const listenOnDragStateChanges = () => {
            const animContextCanceller: { status: boolean } = {status: false};
            let initialItemState: ViewAssemblyTypeStateResourceLayoutItemSchema;

            const movementInteractionSubscription = this.pageComponent.layoutItemStartMovementInteraction$
                .pipe(
                    // map(() => gw.movingItem),
                    takeUntil(this.pageComponent.layoutItemEndMovementInteraction$)
                )
                .subscribe(
                    (movingGridsterItem) => {
                        initialItemState = movingGridsterItem;
                        this.updateViewWhile(animContextCanceller);
                    },
                    (err) => {
                        console.error("animation error", err);
                    },
                    () => {
                        animContextCanceller.status = true;
                        // clean up
                        movementInteractionSubscription.unsubscribe();

                        // after moving, synchronize connectors in an attempt to play back any wrong paths
                        // that can occur if changing quickly
                        this.updateViewUntil(this.pageComponent.gridContainerAssemblyInstance.transitionDuration);

                        // recursive chaining needs rethinking
                        listenOnDragStateChanges();
                    }
                );
        };

        // keep within the zone else transitions to resize, move grid items are not in sync
        listenOnDragStateChanges();

    }

    // model mutation, yielding status of operation
    private removeConnectorRelation(relation: SocketConnectorRelationModel) {

        /*
        console.log("delete relation implementation..", relation);
        if (this.gridStateManager.removeConnectorRelation(relation)) {
            console.log("deleted relation", relation);
        } else {
            console.error("could not delete relation", relation);
        }
        */

    }

    private relayout() {
        this.cdr.markForCheck();
    }

    // usually when leaving the page
    private cleanup() {
        // todo: why invoked twice transitioning from nodeflow to non-nodeflow ( no noticeable side effects)
        this.dashboardPageComponentSubscriptionList.forEach((sub) => sub.unsubscribe());
        this.cardParseNotificationOverlayService.hide();
        this.gridStateManager.uninitializeStore();
    }


}


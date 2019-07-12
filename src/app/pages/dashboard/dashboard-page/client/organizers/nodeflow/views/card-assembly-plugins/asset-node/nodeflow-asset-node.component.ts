import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Host,
    Inject,
    OnDestroy,
    OnInit,
    Renderer2
} from "@angular/core";
import { combineLatest, merge, Observable, Subject } from "rxjs";
import {
    AssetNodeCardMetadataSchema,
    AssetTypeConfigurationSchema,
    NodeflowAssetNodeComponentInteractionRules,
    NodeflowAssetNodeComponentInteractionSelectingState,
    NodeflowAssetNodeDataModel
} from "./nodeflow-asset-node.model";
import { NodeflowAssetNodeService } from "./nodeflow-asset-node.service";
import { NodeflowAssetNodeDataRecordEntitySchema } from "./nodeflow-asset-node.interface";
import { NodeflowAssetNodeParserService } from "./nodeflow-asset-node-parser.service";
import { StandardLayoutAssemblyCardBase } from "../../../../../common/standard/card-outlet/card-assembly-plugins/base/standard-layout-assembly-card-base";
import { StandardFieldMetadata } from "../../../../../common/standard/organizer/standard-template.interface";
import { debounceTime, distinctUntilChanged, map, tap } from "rxjs/operators";
import {
    Alias,
    Parameters,
    TemplateLibraryManager,
    Translation
} from "ngx-card-deck";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import {
    CardOutletComponent,
    CardResourceInjectionTokenValue
} from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import { NodeModel } from "../../../../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { NodeflowViewModelFacade } from "../../../../../../../studio/nodeflow-studio-compositor/nodeflow-studio.interface";
import { CollapsibleCardWindowProvider } from "./collapsible-card-window.provider";
// service should load
import * as assetTypeList from "./data/asset-type-list.json";


const resources = {
    assetTypeIconClassPrefix: "nodeflow-studio-canvas-icon",
    assetTypeList: assetTypeList.default as any as Array<AssetTypeConfigurationSchema>,

    layout: {
        // highlight plugin when previewing a future action
        selectingClass: {
            [NodeflowAssetNodeComponentInteractionSelectingState.none]: "selectingState-none",
            [NodeflowAssetNodeComponentInteractionSelectingState.focused]: "selectingState-focused"
        },

        responsiveBreakpoint: {
            // opinionated RWD, auto-collapse details
            compact: {
                width: 200,
                height: 100
            }
        }
    }

};

@Component({
    selector: 'nodeflow-asset-node',
    viewProviders: [TemplateLibraryManager, Translation, Parameters, Alias, NodeflowAssetNodeService, NodeflowAssetNodeParserService, CollapsibleCardWindowProvider],
    styleUrls: ['./nodeflow-asset-node.scss', '../../card-templates/nodeflow-asset-node/nodeflow-asset-node-template.scss'],
    templateUrl: './nodeflow-asset-node.html'
})
export class NodeflowAssetNodeComponent<T extends NodeflowAssetNodeDataModel, F extends StandardFieldMetadata, S extends NodeflowAssetNodeService<T>, E extends NodeflowAssetNodeDataRecordEntitySchema> extends StandardLayoutAssemblyCardBase<T, F, S, E> implements OnInit, OnDestroy {


    // card outlet's topic defined via `provisionMessageDeliveryTopic`
    outletMessageDeliveryTopicMap = {
        onLayoutChange: "onRequestCompositorViewLayout" // signal token for layout change to the project
    };

    cardMetadata: AssetNodeCardMetadataSchema = {derived: {}} as any;
    interaction: NodeflowAssetNodeComponentInteractionRules = {selecting: NodeflowAssetNodeComponentInteractionSelectingState.none};


    private _compositorNodeChange$: Subject<NodeModel> = new Subject();
    private _cardDimensionCompactResponsiveViewChange$: Observable<boolean>; // when card is unreasonably small

    private _nodeflowCompositorViewModel: NodeflowViewModelFacade;


    constructor(// interface token conformance requirement
        @Inject(forwardRef(() => CARD_RESOURCE_TOKEN)) public resourceToken: CardResourceInjectionTokenValue,
        @Inject(forwardRef(() => CardOutletComponent)) protected _outlet: CardOutletComponent,
        @Host() public library: TemplateLibraryManager, // composes collection of template-oriented libraries
        public collapsibleCardWindowProvider: CollapsibleCardWindowProvider, // roll up card item into compact form ( 1 row high )

        protected _globalState: GlobalStateBase,
        protected _cd: ChangeDetectorRef,
        protected _renderer: Renderer2,
        protected _service: NodeflowAssetNodeService<T>,
        private _dashboardComponent: DashboardComponent,
        private _element: ElementRef
    ) {
        super(resourceToken, _cd, _outlet, _globalState);

        this.prepareTemplate();
        this.setupHeaderSection();
    }


    // view handle to the studio compositor (component instance dependency)
    public get viewModel(): NodeflowViewModelFacade {
        return this._nodeflowCompositorViewModel;
    }

    // after getting the associated node model from the outer stream, allow the template to share it
    public get onCompositorNodeChange$(): Observable<NodeModel> {
        return this._compositorNodeChange$.asObservable();
    }

    // whenever the card is too small to justify presenting any of the rich content
    public get onCardDimensionCompactViewChange$(): Observable<boolean> {
        return this._cardDimensionCompactResponsiveViewChange$;
    }

    // subject emitters

    // canonical process for registering view model onto plugin and synchronizing loosely coupled components
    public attachViewModel(viewModelFacade: NodeflowViewModelFacade) {
        this._nodeflowCompositorViewModel = viewModelFacade;
        this._compositorNodeChange$.next(viewModelFacade.nodeModel);
        // inject view providers
        this.collapsibleCardWindowProvider.setViewModel(viewModelFacade);

        // bind signal to trigger compositor to perform a layout
        // balance change detection responsibility
        this._cd.markForCheck();

        // coalesces any relationship changes into a CD trigger
        this.assemblySubscriptionList.push(
            merge(viewModelFacade.onNodeConsumerRelationsChange$, viewModelFacade.messageConnectivityDelegate.onSocketConnectorRelationCollectionChange())
                .pipe(debounceTime(0))
                .subscribe((obs$) => {
                    this.forceViewRelayout();
                })
        );

    }

    ngOnInit() {
        super.ngOnInit();
        this.initialize();
    }

    ngOnDestroy() {
        this.detachViewModel();
        super.ngOnDestroy();
    }

    // establish title and icon combo
    setupHeaderSection() {
        //super.setupHeaderSection();
        this._outlet.isHeaderVisible = Boolean(this.library.alias.parameters["card.isHeaderVisible"]) || false;
        this._outlet.title = this.library.alias.cardI18n["card.title"];
        this._outlet.titleIconClasses = this.library.alias.parameters["card.iconClassesList"] as Array<string>;
    }

    // event: toggle a focused state state. useful as a means to giving highlight effect to a plugin, when selecting from list
    public onSelectingStateChangeEvent(show: boolean) {

        this.interaction.selecting = show
            ? NodeflowAssetNodeComponentInteractionSelectingState.focused
            : NodeflowAssetNodeComponentInteractionSelectingState.none;

        // toggle presentation on
        this.resourceToken.outlet.activateEnumeratedClass(this.resourceToken.outlet.layoutItemContainerElement, this.interaction.selecting, resources.layout.selectingClass);
    }

    // -------------- interface fulfillment ----------------------------
    prepareDataStream(): Observable<T> {

        const o$ = this._service.streamInitialDataModel(this.resourceToken.card, this._dashboardComponent)
            .pipe(map((val) => val as T)); // unwrap cast

        this.assemblySubscriptionList.push(
            o$.subscribe((data) => {

                if (data.response) {
                    this.widgetDataEntity = <E>((data as T).response.entity);
                } else {
                    // missing data case
                }

                this.loadedFlag = true;
                this.forceViewRelayout();
                this.resourceToken.outlet.forceViewRelayout();
            })
        );

        return o$;
    }

    // transfers custom template binding as an embedded view immediately after header contents
    setupHeaderTemplateView() {
        if (this.headerSection && this._outlet.headerAfterBlockTemplateContainerRef) {
            this.headerEmbeddedViewRef = this._outlet.headerAfterBlockTemplateContainerRef.createEmbeddedView(this.headerSection, {}, 0);
        }
    }


    protected detachViewModel() {
        // not dereference it manually, ViewDestroyError will occur
        // this._nodeflowCompositorViewModel = undefined as any;

        this._compositorNodeChange$.complete();
    }


    // capability: card outlet generic pipe receives NodeModel
    // shared signal between compositor and plugin
    // this.onRequestLayoutChange$ = this.resourceToken.outlet.provisionMessageDeliveryTopic(this.onLayoutChangeTopic);
    // this.compositorGridNodeModel$ = this._outlet.provisionMessageDeliveryTopic("compositorGridNodeModel");

    private initialize() {
        this.initializeSummaryData();
        this.importCardMetadata();
        this.onSelectingStateChangeEvent(false);


        // convention: determine when card is compact. Not useful for presenting content
        this._cardDimensionCompactResponsiveViewChange$ = merge(this.collapsibleCardWindowProvider.cardWindowRollupStateChange$, this.createCompactResponsiveViewListener());

    }

    private initializeSummaryData() {
        // default state prior to stream result
        // this.viewModel = { name: [] };
    }

    private importCardMetadata() {
        this.cardMetadata.schema = this.library.alias.parameters["model"]; // extract config model
        this.cardMetadata.businessProvider = this.library.alias.parameters["provider"]["business"]; // extract business model

        // simple model for node. Fetch type and spell out the icon class name
        const fetchedAssetType = resources.assetTypeList.find(assetType => assetType.assetTypeId === this.cardMetadata.businessProvider.assetTypeId);
        if (fetchedAssetType) {
            this.cardMetadata.assetType = fetchedAssetType;
            // relate iconography from sprite
            this.cardMetadata.derived.assetTypeIconClass = [resources.assetTypeIconClassPrefix, this.cardMetadata.assetType.iconDecoratorClass].join("-");
        }

    }

    // signals when size of card becomes too small
    private createCompactResponsiveViewListener(): Observable<boolean> {
        return combineLatest([
            this.streamCardLayoutDimension("width").pipe(distinctUntilChanged()),
            this.streamCardLayoutDimension("height").pipe(distinctUntilChanged())
        ]).pipe(
            map((predicateDimensions) => ((
                    predicateDimensions[0] < resources.layout.responsiveBreakpoint.compact.width ||
                    predicateDimensions[1] < resources.layout.responsiveBreakpoint.compact.height
                ))
            ),

            distinctUntilChanged()
        );

    }
}

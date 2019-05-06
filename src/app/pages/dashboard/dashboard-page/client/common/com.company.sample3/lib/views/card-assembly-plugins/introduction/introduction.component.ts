import { ChangeDetectorRef, Component, forwardRef, Host, Inject, OnDestroy, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import {
    Alias,
    Parameters,
    TemplateLibraryManager,
    Translation
} from "ngx-card-deck";
import {
    CardOutletComponent,
    CardResourceInjectionTokenValue
} from "ngx-card-deck";
import { StandardLayoutAssemblyCardBase } from "../../../../../standard/card-outlet/card-assembly-plugins/base/standard-layout-assembly-card-base";
import { StandardFieldMetadata } from "../../../../../standard/organizer/standard-template.interface";
import * as assetTypeList from "./data/configuration.json";
import {
    IntroductionAssetTypeConfigurationSchema,
    IntroductionDataRecordEntitySchema,
    SimpleIntroductionMessageHistory
} from "./introduction.interface";
import { IntroductionCardAssemblyPluginModel, IntroductionDataModel } from "./introduction.model";
import { IntroductionService } from "./introduction.service";
import { IntroductionParserService } from "./parser/introduction-parser.service";


const resources = {
    assetTypeIconClassPrefix: "introduction-icon",
    assetTypeList: assetTypeList.default as any as Array<IntroductionAssetTypeConfigurationSchema>,
};

@Component({
    // selector syntax optional
    viewProviders: [TemplateLibraryManager, Translation, Parameters, Alias],
    templateUrl: "introduction.html",
    styleUrls: ["introduction.scss", "../../card-templates/components/simple-introduction/simple-introduction-template.scss"]
})
export class IntroductionComponent<T extends IntroductionDataModel, F extends StandardFieldMetadata, S extends IntroductionService<T>, E extends IntroductionDataRecordEntitySchema> extends StandardLayoutAssemblyCardBase<T, F, S, E> implements OnInit, OnDestroy {

    cardModel: IntroductionCardAssemblyPluginModel;

    constructor(// interface token conformance requirement
        @Inject(forwardRef(() => CARD_RESOURCE_TOKEN)) public resourceToken: CardResourceInjectionTokenValue,
        @Inject(forwardRef(() => CardOutletComponent)) protected _outlet: CardOutletComponent,
        @Host() public library: TemplateLibraryManager, // composes collection of template-oriented libraries

        protected _globalState: GlobalStateBase,
        protected _cd: ChangeDetectorRef,
        protected _service: IntroductionService<T>,
        private _parser: IntroductionParserService<F>,
        private _dashboardComponent: DashboardComponent,
    ) {
        super(resourceToken, _cd, _outlet, _globalState);

        this.cardModel = new IntroductionCardAssemblyPluginModel(this.library);
        this.prepareTemplate();
        this.setupHeaderSection();
    }

    ngOnInit() {
        super.ngOnInit();
        this.initialize();
    }

    ngOnDestroy() {
        // perform any clean up of objects, subscriptions
        super.ngOnDestroy();
    }

    // establish title and icon combo
    setupHeaderSection() {
        super.setupHeaderSection(); // defaults
    }

    // transfers custom template binding as an embedded view immediately after header contents
    setupHeaderTemplateView() {
        if (this.headerSection && this._outlet.headerAfterBlockTemplateContainerRef) {
            this.headerEmbeddedViewRef = this._outlet.headerAfterBlockTemplateContainerRef.createEmbeddedView(this.headerSection, {}, 0);
        }
    }

    // -------------- interface fulfillment ----------------------------

    // fetch and transform dataset
    prepareDataStream(): Observable<T> {

        const o$ = this._service.streamInitialDataModel(this.resourceToken.card, this._dashboardComponent).pipe(map((val) => val as T));

        this.assemblySubscriptionList.push(
            o$.subscribe((data) => {
                const responseParser = this._parser.register(this.resourceToken.card, this.library, this.fieldMetadataList);
                this.cardModel.model.devices = responseParser.transform(responseParser.extract(data.response.entity));
                this.cardModel.model.title = data.response.entity.name;
                this.cardModel.model.product = data.response.entity.product;

                this._outlet.subtitle = data.response.entity.organization;

                if (data.response) {
                    this.widgetDataEntity = <E>((data as T).response.entity);
                } else {
                    // missing data case
                }

                this.loadedFlag = true;
                this._cd.markForCheck();
                this.resourceToken.outlet.forceViewRelayout();
            })
        );

        return o$;
    }

    // emulates secure chat channel between card outlets
    onBroadcastCardMessage(message: string) {
        this._outlet.broadcastMessageDeliveryTopic(this.cardModel.providers.introduction.channelTopic, {
            message, name: this.resourceToken.card.resourceId, icon: this.cardModel.model.viewAssetIconClass
        });
    }

    private initialize() {
        this.importCardModelMetadata();
        this.subscribeMessageEvents();
    }

    // extracts and references provider rules set in the resource bundles
    private importCardModelMetadata() {
        // hydrate `AssetTypeConfigurationSchema` from serialized form
        const fetchedAssetType = resources.assetTypeList.find(assetType => assetType.assetTypeId === this.cardModel.providers.introduction.assetTypeId);
        if (fetchedAssetType) {
            this.cardModel.model.assetType = fetchedAssetType;
            this.cardModel.model.viewAssetIconClass = [resources.assetTypeIconClassPrefix, this.cardModel.model.assetType.iconDecoratorClass].join("-"); // relate icon from sprite
        }

    }

    // emulates secure chat channel between card outlets
    private subscribeMessageEvents() {
        this.resourceToken.outlet.provisionMessageDeliveryTopic(this.cardModel.providers.introduction.channelTopic).subscribe(
            (payload) => {
                this.onReceiveCardMessage(payload.name, payload.icon, payload.message);
            });
    }

    // accept message delivery, unpack and place into history list
    private onReceiveCardMessage(senderName: string, senderIcon: string, message: string) {
        const messageStructure: Partial<SimpleIntroductionMessageHistory> = {senderName, senderIcon, message};
        this.cardModel.model.messageHistoryList.push(messageStructure as SimpleIntroductionMessageHistory);

        requestAnimationFrame(() => { // trigger transition
            messageStructure.receivedDate = new Date();
            this._cd.markForCheck();
        });

    }

}

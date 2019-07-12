import { ChangeDetectorRef, Component, ElementRef, forwardRef, Host, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import { DashboardAssemblyLayout } from "ngx-card-deck";
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
import { MetricsListTransformerService } from "../../../../../common/com.company.sample1/views/card-assembly-plugins/metrics-billboard/metrics-list-transformer.service";
import { MetricsParserService } from "../../../../../common/com.company.sample1/views/card-assembly-plugins/metrics-billboard/metrics-parser.service";
import { StandardLayoutAssemblyCardBase } from "../../../../../common/standard/card-outlet/card-assembly-plugins/base/standard-layout-assembly-card-base";
import { StandardFieldMetadata } from "../../../../../common/standard/organizer/standard-template.interface";
import { NumericTransformValueItem } from "../../../lib/services/sample-product/platform/demo-app-terminology.interface";
import { MetricsBillboardDataRecordEntitySchema } from "./metrics-billboard.interface";
import { MetricsBillboardDataModel } from "./metrics-billboard.model";
import { MetricsBillboardService } from "./metrics-billboard.service";

@Component({
    selector: 'demo-metrics-billboard',
    viewProviders: [TemplateLibraryManager, Translation, Parameters, Alias, MetricsBillboardService, MetricsParserService, MetricsListTransformerService],
    styleUrls: ['./metrics-billboard.scss', '../../../../../common/com.company.sample1/views/card-templates/components/demo-client-metrics-billboard/demo-client-metrics-billboard-template.scss'],
    templateUrl: './metrics-billboard.html'
})
export class MetricsBillboardComponent<T extends MetricsBillboardDataModel, F extends StandardFieldMetadata, S extends MetricsBillboardService<T>, E extends MetricsBillboardDataRecordEntitySchema> extends StandardLayoutAssemblyCardBase<T, F, S, E> implements OnInit, OnDestroy {

    // generalized array of data as iterable items
    public billboardEntity: MetricsBillboardDataRecordEntitySchema;

    // post transformed of the consumable
    public numericTransformedValueItemsList: Array<NumericTransformValueItem>;


    // layout related metadata properties
    public layout: {
        availableScrollHeightMetric: number;
    };

    // data pointer to assembly layout
    protected assemblyLayout: DashboardAssemblyLayout<any>;

    constructor(// interface token conformance requirement
        @Inject(forwardRef(() => CARD_RESOURCE_TOKEN)) public resourceToken: CardResourceInjectionTokenValue,
        @Inject(forwardRef(() => CardOutletComponent)) protected _outlet: CardOutletComponent,
        @Host() public library: TemplateLibraryManager, // composes collection of template-oriented libraries


        protected _globalState: GlobalStateBase,
        protected _cd: ChangeDetectorRef,
        protected _service: MetricsBillboardService<T>,
        private _parser: MetricsParserService<F>,
        private _element: ElementRef,
        private _dashboardComponent: DashboardComponent,
    ) {


        super(resourceToken, _cd, _outlet, _globalState);

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

    public show(o: any) {
        console.log("show", o);
    }


    // establish title and icon combo
    setupHeaderSection() {
        this._outlet.isHeaderVisible = Boolean(this.library.alias.parameters["card.isHeaderVisible"]) || false;
        this._outlet.title = this.library.alias.cardI18n["card.title"];
        this._outlet.titleIconClasses = this.library.alias.parameters["card.iconClassesList"] as Array<string>;
    }

    setupHeaderTemplateView() {
    }


    // -------------- interface fulfillment ----------------------------

    // fetch and transform dataset
    prepareDataStream(): Observable<T> {

        const o$ = this._service.streamInitialDataModel(this.resourceToken.card, this._dashboardComponent).pipe(map((val) => val as T));

        this.assemblySubscriptionList.push(
            o$.subscribe((data) => {
                const responseParser = this._parser.register(this.resourceToken.card, this.library, this.fieldMetadataList);

                this.billboardEntity = data.response.entity;
                const resourceMetersEntries = this.billboardEntity.resourceMeters.slice(0); // clone
                this.numericTransformedValueItemsList = responseParser.transform(responseParser.extract(data.response.entity));

                this.loadedFlag = true;
                this.forceViewRelayout();
                this.resourceToken.outlet.forceViewRelayout();
            })
        );

        return o$;
    }

    // -------------- internals --------------------
    // set up instance data streams and configuration
    private initialize() {

        /*
        this.assemblyLayout = this.resourceToken.card.resolver.injectorInstance as DashboardAssemblyLayout<any>;
        this.initialDataModelResponse$ = this.prepareDataStream();

        this.startInteractionEvents(); // base

        const assemblyLayoutClassMetadata = this.assemblyLayout.classificationMetadata();
        const assemblyLayoutState = this.assemblyLayout.state();

        // resolve and bootstrap custom template(s) that have a dependency from this component when rendering
        const componentLayoutInstanceMetadata = assemblyLayoutState.findConfigurationResourceByType(
            assemblyLayoutClassMetadata.layoutResourceType,
            assemblyLayoutClassMetadata.layoutMetadataKey);

        if (componentLayoutInstanceMetadata) {

            this._service.loadingDashboardCardTemplatableClass(this.resourceToken.card, componentLayoutInstanceMetadata)
                .then((clazz) => {

                        if (clazz) {
                            // page binding module and template component bootstrapping
                            this._service.loadingDashboardCardTemplatableModule(this.resourceToken.card, componentLayoutInstanceMetadata)
                                .then((templatableModuleFactory) => {

                                    this.derivedTemplatableClass = clazz;
                                    this.derivedTemplateModuleFactory = templatableModuleFactory;

                                    setTimeout(() => {
                                        // integration steps phased after tick
                                        this.isTemplatePhaseReady = true; // step1
                                        this._cd.markForCheck(); // deps load and prep
                                    }, 0);

                                    this.isComponentPhaseReady = true; // step2 - alas render billboard component
                                    this._cd.markForCheck();

                                }, (failure) => {

                                    console.error("bundle unavailable", assemblyLayoutClassMetadata);
                                });
                        }

                    },
                    (rejection) => {
                        // note: a template is not required per-se, as the fundamental widget may be sufficient without extension
                        // however, a template cannot be loaded unless the metadata declares it *per field*
                        console.error("template association failure", this.resourceToken.card.resourceId, rejection);
                    }
                );
            // ~~~~~~~~~~~~~~

        } else {
            console.error("unresolvable", Object.getPrototypeOf(this).constructor.name, "configuration resource", assemblyLayoutState, assemblyLayoutClassMetadata.layoutMetadataKey);
        }

        // meanwhile, extract field definitions
        this.fieldMetadataList = this._service.prepareFieldMetadataList<MetricsBillboardFieldMetadata>(this.resourceToken.card);

        // after requesting data, setup fields
        // establish templating views
        this.fieldMetadataList.forEach((col: any) => {
            this.positionBasedTemplateMap.header[col.id] = this.defaultHeaderTemplate; // default
            this.positionBasedTemplateMap.body[col.id] = this.defaultBodyTemplate; // default
        });

         */

    }

    //  occupies how much allotted space in the card, given there are other elements and constraints to consider?
    private calculateAvailableScrollHeightMetric(containerHeight: number): number {
        return (containerHeight - this._outlet.sumSectionsHeightExcept([this._element]));
    }

}

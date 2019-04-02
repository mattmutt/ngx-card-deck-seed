import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Host,
    Inject,
    OnInit,
    TemplateRef
} from "@angular/core";


import {
    Alias,
    LayoutAssemblyCardBase,
    Parameters,
    TemplateLibraryManager,
    Translation
} from "ngx-card-deck";
import { DashboardAssemblyLayout } from "ngx-card-deck";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import {
    CardOutletComponent,
    CardResourceInjectionTokenValue
} from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import { Observable } from "rxjs";
import { NumericTransformValueItem } from "../../../lib/services/sample-product/platform/demo-app-terminology.interface";
import { SummaryBillboardDataModelSchema, SummaryBillboardFieldMetadata } from "./summary-billboard.interface";
import { SummaryBillboardDataModel } from "./summary-billboard.model";
import { SummaryBillboardService } from "./summary-billboard.service";
import { SummaryParserService } from "../../../../../common/com.company.sample1/views/card-assembly-plugins/summary-billboard/summary-parser.service";

@Component({
    // models provided in isolation
    viewProviders: [TemplateLibraryManager, Translation, Parameters, Alias, SummaryBillboardService, SummaryParserService],
    selector: 'demo-summary-billboard',
    templateUrl: './summary-billboard.html',
    styleUrls: ['./summary-billboard.scss', '../../../../../common/com.company.sample1/views/card-templates/components/demo-client-summary-billboard/demo-client-summary-billboard-template.scss']

    // changeDetection: ChangeDetectionStrategy.OnPush // accel, as data is a snapshot

})
export class SummaryBillboardComponent extends LayoutAssemblyCardBase<SummaryBillboardDataModel> implements OnInit, AfterViewInit, AfterContentInit {

    // specialization
    public initialDataModelResponse$: Observable<SummaryBillboardDataModel>;

    public isTemplatePhaseReady = false;
    public isComponentPhaseReady = false;

    // generalized array of data as iterable items
    public billboardEntity: SummaryBillboardDataModelSchema;

    // post transformed of the consumable
    public numericTransformedValueItemsList: Array<NumericTransformValueItem>;


    // position-based view mapping
    public positionBasedTemplateMap: {
        header: { [identifier: string]: TemplateRef<any> };
        body: { [identifier: string]: TemplateRef<any> };
        footer: { [identifier: string]: TemplateRef<any> };
    };

    // layout related metadata properties
    public layout: {
        availableScrollHeightMetric: number;
    };

    public fieldMetadataList: Array<SummaryBillboardFieldMetadata>;

    // data pointer to assembly layout
    protected assemblyLayout: DashboardAssemblyLayout<any>;

    constructor(// interface token conformance requirement
        @Inject(forwardRef(() => CARD_RESOURCE_TOKEN)) public resourceToken: CardResourceInjectionTokenValue,
        @Inject(forwardRef(() => CardOutletComponent)) protected _outlet: CardOutletComponent,
        @Host() public library: TemplateLibraryManager, // composes collection of template-oriented libraries

        protected _globalState: GlobalStateBase,
        protected _cd: ChangeDetectorRef,
        private _dashboardComponent: DashboardComponent,
        private _element: ElementRef,
        private _parser: SummaryParserService,
        private _service: SummaryBillboardService<SummaryBillboardDataModel>) {

        super(resourceToken, _cd, _outlet, _globalState);


        this.setupHeaderSection();

        // physical positions within the billboard
        this.positionBasedTemplateMap = {
            header: {},
            body: {},
            footer: {}
        };

        this.layout = {} as any;
    }

    public show(o: any) {
        console.log("show", o);
    }


    // establish title and icon combo
    setupHeaderSection() {
        setTimeout(() => this._outlet.isHeaderVisible = true);

        this._outlet.title = this.library.alias.cardI18n["card.title"];
        this._outlet.titleIconClasses = this.library.alias.parameters["card.iconClassesList"] as Array<string>;
    }

    setupHeaderTemplateView() {
    }

    ngAfterViewInit() {

    }

    ngAfterContentInit() {

    }


    ngOnInit() {
        super.ngOnInit();
        this.initialize();
    }


    // -------------- interface fulfillment ----------------------------

    // request async data
    public prepareDataStream(): Observable<SummaryBillboardDataModel> {

        const o$ = this._service.streamInitialDataModel(this.resourceToken.card, this._dashboardComponent) as Observable<SummaryBillboardDataModel>;

        o$.subscribe((mbdm) => {
            this.billboardEntity = mbdm.response.entity;

            // view layer
            const billboardDashboardEntity = Array.prototype.slice.call(this.billboardEntity.dashboardData);

            this.numericTransformedValueItemsList = this._parser.deriveVisibleModelItemsList(billboardDashboardEntity);

            // example structure
            this.fieldMetadataList = [
                {
                    "id": "inventory_entity_name",
                    "type": {
                        "classifier": "string"
                    },
                    "text": {
                        "header": {
                            "key": "inventory_entity_name"
                        }
                    },
                    "layout": {
                        "alignment": "left",
                        "dimensions": {
                            "width": {
                                "initial": {
                                    "value": 50,
                                    "metric": "%"
                                }
                            }
                        }
                    },
                    "view": {
                        "body": {
                            "organization": "project1",
                            "template": "inventorySummaryNameItem",
                            "context": {
                                "schema": "",
                                "variables": {
                                    "color": "blue"
                                }
                            }
                        }
                    }
                },
                {
                    "id": "inventory_entity_count_graph",
                    "type": {
                        "classifier": "number"
                    },
                    "text": {
                        "header": {
                            "key": "inventory_entity_count"
                        }
                    },
                    "layout": {
                        "alignment": "left",
                        "dimensions": {
                            "width": {
                                "initial": {
                                    "value": 20,
                                    "metric": "%"
                                }
                            }
                        }
                    },
                    "view": {
                        "body": {
                            "organization": "project1",
                            "template": "inventorySummaryCountGraphItem",
                            "context": {
                                "schema": "",
                                "variables": {
                                    "bar-foreground-color": "#fd8c7f"
                                }
                            }
                        }
                    }
                },
                {
                    "id": "inventory_entity_count",
                    "type": {
                        "classifier": "number"
                    },
                    "text": {
                        "header": {
                            "key": ""
                        }
                    },
                    "layout": {
                        "alignment": "right",
                        "dimensions": {
                            "width": {
                                "initial": {
                                    "value": 20,
                                    "metric": "%"
                                }
                            }
                        }
                    },
                    "view": {
                        "body": {
                            "organization": "project1",
                            "template": "inventorySummaryCountItem",
                            "context": {
                                "schema": "",
                                "variables": {}
                            }
                        }
                    }
                },
                {
                    "id": "inventory_entity_percentage",
                    "type": {
                        "classifier": "number"
                    },
                    "text": {
                        "header": {
                            "key": "inventory_entity_percentage"
                        }
                    },
                    "layout": {
                        "alignment": "left",
                        "dimensions": {
                            "width": {
                                "initial": {
                                    "value": 0,
                                    "metric": "%"
                                }
                            }
                        }
                    },
                    "view": {
                        "body": {
                            "organization": "project1",
                            "template": "inventorySummaryPercentageItem"
                        }
                    }
                }
            ];


            if (this.fieldMetadataList) {
                const fieldIdsList = this.fieldMetadataList.map((o) => o.id);
                this.numericTransformedValueItemsList = this._parser.deriveVisibleModelItemsList(billboardDashboardEntity);
                //    .filter((o) => fieldIdsList.indexOf(o.model["label"]) >= 0); // specific inclusion
            }

            this.loadedFlag = true;

            this.updateCardCountView();

            this.forceViewRelayout();
        });

        return o$;
    }


    // ------------------ internals --------------------

    // set up instance data streams and configuration
    private initialize() {
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

            // ~~~~~~~~~~~~~~
            this._service.loadingDashboardCardTemplatableClass(this.resourceToken.card, componentLayoutInstanceMetadata).then(
                (clazz) => {

                    if (clazz) {
                        this.derivedTemplatableClass = clazz;

                        // integration steps phased
                        this.isTemplatePhaseReady = true; // step1
                        this._cd.markForCheck(); // deps load and prep

                        this.isComponentPhaseReady = true; // step2 - alas render billboard component
                        this._cd.markForCheck();

                    } else {
                        // no template
                    }
                },
                (rejection) => {
                    // no template assigned - they are optional afterall
                    // console.error("summary template association failure", this.resourceToken.card.resourceId, rejection);
                }
            );
            // ~~~~~~~~~~~~~~

        } else {
            console.error("unresolvable", Object.getPrototypeOf(this).constructor.name, "configuration resource", assemblyLayoutState, assemblyLayoutClassMetadata.layoutMetadataKey);
        }

        // meanwhile, extract field definitions
        this.fieldMetadataList = this._service.prepareFieldMetadataList<SummaryBillboardFieldMetadata>(this.resourceToken.card);

        // after requesting data, setup fields
        // establish templating views
        this.fieldMetadataList.forEach((col: any) => {
            this.positionBasedTemplateMap.header[col.id] = this.defaultHeaderTemplate; // default
            this.positionBasedTemplateMap.body[col.id] = this.defaultBodyTemplate; // default
        });

    }

    //  occupies how much allotted space in the card, given there are other elements and constraints to consider?
    private calculateAvailableScrollHeightMetric(containerHeight: number): number {
        return (containerHeight - this._outlet.sumSectionsHeightExcept([this._element]));
    }


    // metadata qualifies the count field
    private updateCardCountView() {
        const idField = "card.subtitleFieldIdentifier";
        const minimumCountValueRendered = 1;
        // extract actual count
        const countNumber = parseInt(this.getDashboardEntityValueByField(this.library.alias.parameters[idField]), 0);
        if (countNumber >= minimumCountValueRendered) {
            this._outlet.subtitle = countNumber.toString();
        }
        // this.forceViewRelayout();
        this.resourceToken.outlet.forceViewRelayout();
    }


    // extract from defined dataset
    private getDashboardEntityValueByField(fieldLabel: string): string {
        const matches = this.billboardEntity.dashboardData.filter((o) => o.label === fieldLabel);
        return (matches.length && matches[0].value) || "";
    }


}


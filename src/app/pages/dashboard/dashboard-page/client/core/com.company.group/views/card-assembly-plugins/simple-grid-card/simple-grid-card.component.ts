import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Host,
    Inject,
    OnInit,
    QueryList,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import { ClrDatagrid } from "@clr/angular";

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


import { SimpleGridCardService, SimpleGridDataRecordEntitySchema } from "./simple-grid-card.service";
import { Observable } from "rxjs";
import { debounceTime, delay } from "rxjs/operators";
import { SimpleGridDataModel } from "./simple-grid-card.model";
import { RelationalDataFieldMetadata } from "./grid-relational-data-field-model.interface";
import { DatagridRenderOrganizer } from "@clr/angular/data/datagrid/render/render-organizer";
import { SimpleGridParserService } from "../../../../../common/com.company.sample1/views/card-assembly-plugins/simple-grid-card/parser/simple-grid-parser.service";


@Component({
    viewProviders: [TemplateLibraryManager, Translation, Parameters, Alias],

    selector: 'dash-simple-grid-card',
    styleUrls: ['./simple-grid-card.scss', '../../../../../common/com.company.sample1/views/card-templates/components/demo-client-grid-card/demo-client-grid-card-template.scss'],
    templateUrl: './simple-grid-card.html',
    // require manually triggering CD from here on out
    changeDetection: ChangeDetectionStrategy.OnPush // accel, as data is a snapshot

})
export class SimpleGridCardComponent extends LayoutAssemblyCardBase<SimpleGridDataModel> implements OnInit, AfterViewInit, AfterContentInit {

    // specialization
    public initialDataModelResponse$: Observable<SimpleGridDataModel>;
    public initialDataModelResponseModel: SimpleGridDataModel; // for template binding and extracting from original response

    public isTemplatePhaseReady = false;
    public isComponentPhaseReady = false;

    // generalized array of data as iterable items
    public simpleGridRecords: Array<SimpleGridDataRecordEntitySchema>;
    // post processed data
    public transformedSimpleGridRecords: Array<any>;

    // position-based view mapping
    public positionBasedTemplateMap: {
        header: { [identifier: string]: TemplateRef<any> };
        body: { [identifier: string]: TemplateRef<any> };
        footer: { [identifier: string]: TemplateRef<any> };
    };

    // layout related metadata properties
    public layout: {
        allocatedRowObjectsCount: number;
        availableWidthMetric: number; // absolute width of grid
        availableScrollHeightMetric: number;
    };

    public fieldMetadataList: Array<RelationalDataFieldMetadata>;

    // data pointer to assembly layout
    private assemblyLayout: DashboardAssemblyLayout<any>;

    @ViewChild("componentSection") private componentSection: ElementRef; // <section>

    // holds the footer-columns set. will add whitespacing on the right
    @ViewChild("footerContainerMaster") private footerContainerMaster: ElementRef; // <section>

    // grid internals
    @ViewChild("gridComponent") private gridComponent: ClrDatagrid;
    @ViewChild("gridComponent", {read: ViewContainerRef}) private gridComponentViewContainerRef: ViewContainerRef;


    // internal
    // collections of customizations
    @ViewChildren("gridHeader", {read: ViewContainerRef}) private gridHeaderQueryList: QueryList<ViewContainerRef>;
    @ViewChildren("gridFooter", {read: ViewContainerRef}) private gridFooterQueryList: QueryList<ViewContainerRef>;


    constructor(// interface token conformance requirement
        @Inject(forwardRef(() => CARD_RESOURCE_TOKEN)) public resourceToken: CardResourceInjectionTokenValue,
        @Inject(forwardRef(() => CardOutletComponent)) protected _outlet: CardOutletComponent,
        @Host() public library: TemplateLibraryManager, // composes collection of template-oriented libraries

        protected _globalState: GlobalStateBase,
        protected _cd: ChangeDetectorRef,
        private _dashboardComponent: DashboardComponent,
        private _element: ElementRef,
        private _parser: SimpleGridParserService<RelationalDataFieldMetadata>,
        private _renderer: Renderer2,
        private _service: SimpleGridCardService<SimpleGridDataModel>) {

        super(resourceToken, _cd, _outlet, _globalState);

        this.setupHeaderSection();

        // physical positions within the grid
        this.positionBasedTemplateMap = {
            header: {},
            body: {},
            footer: {}
        };

        this.layout = {} as any;

    }

    setupHeaderSection() {

        // just can't comprehend why a bound boolean on structural directive is strict
        setTimeout(() => this._outlet.isHeaderVisible = true); // tick

        this._outlet.title = this.library.alias.cardI18n["card.title"];
        this._outlet.titleIconClasses = this.library.alias.parameters["card.iconClassesList"] as Array<string>;
    }

    setupHeaderTemplateView() {
    }

    ngOnInit() {
        super.ngOnInit();
        this.initialize();
    }

    // lifecycle
    ngAfterContentInit() {

        const clientTicksBetweenLayoutDelay = 100; // be gentle young cowboy. Show your bravado elsewhere

        this.layout.allocatedRowObjectsCount = 100; // guess
        this.layout.availableScrollHeightMetric = this.layout.availableWidthMetric = -1; // flicker artifact restraint. Zero would have hidden erroneously

        // reflow algorithm
        this.assemblySubscriptionList.push(
            this.streamCardLayoutDimension("height").pipe(
                debounceTime(clientTicksBetweenLayoutDelay)
            )
                .subscribe((height: number) => {
                    const calculatedHeight = this.calculateAvailableScrollHeightMetric(height);

                    if (calculatedHeight > 0) {
                        this.layout.availableScrollHeightMetric = calculatedHeight;
                    } else {
                        // saw it happen on release server few times. more of a sequencing incident
                        // console.warn("zero height allocation");
                    }

                    // sensitive change requires CD. else grid won't fit the container
                    this._cd.markForCheck();
                })
        );

        // reflow algorithm / on the headers
        this.assemblySubscriptionList.push(
            this.streamCardLayoutDimension("width").pipe(
                debounceTime(clientTicksBetweenLayoutDelay * 2)
            )
                .subscribe((width: number) => {

                    const scrollbarWidth = 0; // inset when scrollbar
                    this.layout.availableWidthMetric = width + scrollbarWidth;
                    // may not be fully initialized
                    if (this.gridComponent) {
                        this.gridComponent.resize();
                        // relayout caused the height to change, which would require resizing calc
                        this._cd.markForCheck();
                    }
                })
        );

    }

    ngAfterViewInit() {
        // problem is on the async injection of templates, this may take some rethinking to trigger timely
        // (presumed) initialization

        // AOT: required at this position
        // view components melt otherwise
        if (!Object.keys(this.positionBasedTemplateMap).length) {
            // expresses when no templates are bound, just initialize the grid view regardless after a tick
            setTimeout(() => this.initializeGridView(), 0);
        }

    }

    // view template utilities
    public onRefreshEvent(event: any) {

        // sorting will convey this interaction
        // direction is a metadata field

    }

    // synch footer column to a header's size
    public deriveSynchronizedColumnWidth(fieldMetadata: RelationalDataFieldMetadata, fieldIndex: number): number {

        if (this.gridComponent) {

            // rely on body sizings
            if (this.gridComponent.items.displayed.length) {
                // dangerous API usage
                const privateOrganizer: DatagridRenderOrganizer = this.gridComponent["organizer"];

                if (fieldIndex !== privateOrganizer.widths.length - 1) {
                    return (privateOrganizer.widths[fieldIndex].px);
                } else {
                    // last cell handling
                    return (privateOrganizer.widths[fieldIndex].px);
                }

            } else {

                // if no body data yet to reference, rely solely on header
                const match = this.gridHeaderQueryList.filter((val) => val.element.nativeElement.getAttribute("ng-reflect-field") === fieldMetadata.id);
                if (match.length) {
                    const e = match[0].element.nativeElement;
                    const width = e.getBoundingClientRect().width;
                    return width;
                } else {
                    return -1; // auto
                }
            }
        } else {
            return -1;
        }
    }


    // for all layout positions known, generate some CSS classes as standard
    public generateResourcePositionLayoutColumnClassCSS(fieldMetadata: RelationalDataFieldMetadata): string {
        // header retain some distinction
        // now header align of right fails for right most column, it clips
        return ["body", "footer"]
            .map((k: string) => this.generateResourceAbstractColumnClassStyle(fieldMetadata, k))
            .join("");

    }

    // CSS class token generation convention
    public generateResourceAbstractColumnClassName(fieldMetadata: RelationalDataFieldMetadata, positionalProp: string): string {
        const cssTokenSeparator = "_"; // since so many dashes are used, this is
        return [this.resourceToken.card.resourceId, this.resourceToken.card.component, fieldMetadata.id, positionalProp].join(cssTokenSeparator);
    }

    // -------------- interface fulfillment ----------------------------

    // request async data
    public prepareDataStream(): Observable<SimpleGridDataModel> {

        // needs to be scheduled, else title stalled.
        // todo: discover why do titles not show up unless stream is delayed?
        const o$ = (this._service.streamInitialDataModel(this.resourceToken.card, this._dashboardComponent) as Observable<SimpleGridDataModel>).pipe(delay(0));

        this.assemblySubscriptionList.push(
            o$.subscribe((d) => {

                // ETL processing, DAO load and prep
                const responseParser = this._parser.register(this.resourceToken.card, this.library, this.fieldMetadataList);
                if (responseParser) {
                    this.simpleGridRecords = responseParser.extract(d) as Array<any>;
                    this.transformedSimpleGridRecords = responseParser.transform(this.simpleGridRecords);
                } else {
                    // Transformer unavail
                    console.error("no transformer linkage supported for", this.resourceToken.card);
                }
                this.initialDataModelResponseModel = d;

                // resolve and map to pointer used by view reference
                this.loadedFlag = true;
                this.updateCardCountView();
                this.synchronizeFooterLayout();
                this.forceViewRelayout();
            })
        );

        return o$;
    }


    // template invokes this upon its view ready state. prepare the grid when the structure is well known
    public initializeGridView() {
        if (this.gridComponent) {
            this.updateGridLayoutClasses();
            this.updateGridHeaderView();
        }
    }


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

                        this.isComponentPhaseReady = true; // step2 - alas render grid component
                        this._cd.markForCheck();


                        // ESSENTIAL page binding sequence bootstrapping
                        // compile to a factory
                        /*
                        this.preparingTemplateModuleFactory(clazz).then((resolved) => {

                           // integration steps phased
                           this.isTemplatePhaseReady = true; // step1
                           this._cd.markForCheck(); // deps load and prep

                           this.isComponentPhaseReady = true; // step2 - alas render grid component
                           this._cd.markForCheck();

                        });
                        */


                    } else {
                        // no template?
                    }
                },
                (rejection) => {
                    console.error("simple grid card template association failure", this.resourceToken.card.resourceId);
                }
            );
            // ~~~~~~~~~~~~~~

        } else {

            console.error("unresolvable simple grid configuration resource", assemblyLayoutState, assemblyLayoutClassMetadata.layoutMetadataKey);
        }

        // meanwhile, extract field definitions
        this.fieldMetadataList = this._service.prepareFieldMetadataList<RelationalDataFieldMetadata>(this.resourceToken.card);

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


    // add decorative classes for fields
    private updateGridLayoutClasses() {

        const columnStyle = this.componentSection.nativeElement.ownerDocument.createElement("style");

        this._renderer.appendChild(this.componentSection.nativeElement, columnStyle);

        // various column alignments
        columnStyle.textContent = this.fieldMetadataList
            .filter((fieldMetadata) => !!fieldMetadata.layout)
            .map((fieldMetadata) => this.generateResourcePositionLayoutColumnClassCSS(fieldMetadata))
            .join("\n");

    }

    // collapsed header support for some views
    private updateGridHeaderView() {

        const isHeaderVisible = (this.library.alias.parameters['SimpleGridCard']['isHeaderVisible']) || false;
        const dgHeadRowElem = this.gridHeaderQueryList.first.element.nativeElement.parentNode;
        const dgHeadContainerElem = dgHeadRowElem.parentNode;

        // remove header if configured as such
        if (!isHeaderVisible) {
            this._renderer.setStyle(dgHeadRowElem, "height", "0");
            this._renderer.setStyle(dgHeadRowElem, "visibility", "hidden");
            this._renderer.setStyle(dgHeadContainerElem, "height", "0");
            this._renderer.setStyle(dgHeadContainerElem, "border", "none");
            this.gridComponent.resize();
        }


    }


    // metadata qualifies the count field
    private updateCardCountView() {
        const minimumCountValueRendered = 1;

        const countNumber = this.transformedSimpleGridRecords && this.transformedSimpleGridRecords.length;
        if (countNumber >= minimumCountValueRendered) {
            this._outlet.subtitle = countNumber.toString();
        } else {
            this._outlet.subtitle = ""; // missing, unavail, zero, indeterminate
        }
        // this.forceViewRelayout();
        this.resourceToken.outlet.forceViewRelayout();

    }


    // template preparation sequence

    private generateResourceAbstractColumnClassStyle(fieldMetadata: RelationalDataFieldMetadata, position: string): string {

        const m = new Map();
        m.set("text-align", fieldMetadata.layout.alignment);

        // restrain text
        if (fieldMetadata.layout.dimensions) {
            if (fieldMetadata.layout.dimensions.width && fieldMetadata.layout.dimensions.width.initial.clipping) {
                m.set("white-space", "nowrap");
                m.set("overflow-x", "hidden");
                m.set("text-overflow", "ellipsis");
            }
        }

        let generated = "";

        m.forEach((val, key) => {
            if (val !== null && val !== undefined) {
                generated += `${key}: ${val};\n`;
            }
        });

        const gridVCR = this.gridComponentViewContainerRef;
        const gridPrefix = gridVCR.element.nativeElement.tagName;

        let renderComponentClass;
        let renderTargetClassSelector;

        // organized
        switch (position) {
            case "header":
                renderComponentClass = "datagrid-column";
                // need dotted
                renderTargetClassSelector = "." + "datagrid-column-title";
                break;
            default:
                renderComponentClass = "datagrid-cell";
                renderTargetClassSelector = null;
                break;
        }


        // lengthy
        const selector = [gridPrefix,
            `.${renderComponentClass}.${this.generateResourceAbstractColumnClassName(fieldMetadata, position)}`,
            renderTargetClassSelector].filter(Boolean).join(" ");

        return generated ? `${selector}  { ${generated} }` : "";
    }


    // often have to ensure the footer accommodate body scroll by introducing some spacing
    private synchronizeFooterLayout() {

        if (this.footerContainerMaster) {

            const headDirective = this.gridComponentViewContainerRef.element.nativeElement.querySelector(".datagrid-head");

            this._cd.detectChanges(); // determine
            // may need hard whitespace to enforce right most col, accommodating long lists
            if (headDirective) {
                this._renderer.setStyle(this.footerContainerMaster.nativeElement, "paddingRight", headDirective.style.paddingRight);
            }
            this.gridComponent.resize(); // body columns
        }

    }

}

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
    NgZone,
    OnDestroy,
    OnInit,
    QueryList,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import { ClrDatagrid, ClrDatagridFooter } from "@clr/angular";
import { ColumnsService } from "@clr/angular/data/datagrid/providers/columns.service";
import ResizeObserver from "resize-observer-polyfill";
import { BehaviorSubject, Observable } from "rxjs";
import { debounceTime, delay } from "rxjs/operators";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import { DashboardAssemblyLayout } from "ngx-card-deck";
import {
    Alias,
    LayoutAssemblyCardBase,
    Parameters,
    TemplateLibraryManager,
    Translation
} from "ngx-card-deck";
import {
    CardOutletComponent,
    CardResourceInjectionTokenValue
} from "ngx-card-deck";
import { SimpleGridParserService } from "../../../../../common/com.company.sample1/views/card-assembly-plugins/simple-grid-card/parser/simple-grid-parser.service";
import { RelationalDataFieldMetadata } from "./grid-relational-data-field-model.interface";
import { SimpleGridDataModel } from "./simple-grid-card.model";


import { SimpleGridCardService, SimpleGridDataRecordEntitySchema } from "./simple-grid-card.service";

@Component({
    viewProviders: [TemplateLibraryManager, Translation, Parameters, Alias],

    selector: 'dash-simple-grid-card',
    styleUrls: ['simple-grid-card.scss', '../../../../../common/com.company.sample1/views/card-templates/components/demo-client-grid-card/demo-client-grid-card-template.scss'],
    templateUrl: 'simple-grid-card.html',
    // require manually triggering CD from here on out
    changeDetection: ChangeDetectionStrategy.OnPush // accel, as data is a snapshot

})
export class SimpleGridCardComponent extends LayoutAssemblyCardBase<SimpleGridDataModel> implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {

    // specialization
    public initialDataModelResponse$: Observable<SimpleGridDataModel>;
    public initialDataModelResponseModel: SimpleGridDataModel; // for template binding and extracting from original response


    // dimension of ir.. notice code was fixed
    public scrollbarTrackerDimension = 0;

    public datagridLayoutElement: HTMLElement | null; // internal clarity marker
    public gridVerticalScrollChange$ = new BehaviorSubject<boolean>(false);
    public gridHorizontalScrollChange$ = new BehaviorSubject<boolean>(false);
    syncDatagridOverflowDimension = 0;
    syncDatagridTableWidth = -1; // will assign
    syncDatagridTableHeight = -1; // will assign

    syncDatagridTableScrollLeft = 0; // will sync


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

    private initializeGridViewTimer: number;
    private resizeObserverList: Array<ResizeObserver> = [];


    @ViewChild("componentSection", {static: false}) private componentSection: ElementRef; // <section>

    // holds the footer-columns set. will add whitespacing on the right
    @ViewChild("footerContainerMaster", {static: false}) private footerContainerMaster: ElementRef; // <section>

    // grid internals
    @ViewChild("gridComponent", {static: false}) private gridComponent: ClrDatagrid;
    @ViewChild("gridComponent", {static: false, read: ViewContainerRef}) private gridComponentViewContainerRef: ViewContainerRef;
    @ViewChild(ClrDatagridFooter, {static: false}) private gridFooterComponent: ClrDatagridFooter;


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
        protected _zone: NgZone,
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

    // Warning: depending on an indirect approach to gathering column state on the grid. need a cleaner way
    get gridColumnsService(): ColumnsService | undefined {
        return this.gridComponent && this.gridFooterComponent["columnsService"] as ColumnsService; // Clarity internal specification
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
            this.initializeGridViewTimer = setTimeout(() => this.initializeGridView(), 0);
        }

    }

    ngOnDestroy() {
        // knock off DOM util events
        clearTimeout(this.initializeGridViewTimer);
        this.resizeObserverList.forEach((resizer) => resizer.disconnect());
        this.datagridLayoutElement && this.datagridLayoutElement.removeEventListener("scroll", this.scrollDatagridEvent);

        // perform any clean up of objects, subscriptions
        super.ngOnDestroy();
    }

    // view template utilities
    public onRefreshEvent(event: any) {

        // sorting will convey this interaction
        // direction is a metadata field

    }

    // sync footer column to a header's size
    public deriveSynchronizedColumnWidth(fieldMetadata: RelationalDataFieldMetadata, fieldIndex: number): number {
        const unknown = -1;

        if (this.gridComponent) {
            if (this.gridComponent.items.displayed.length) {
                const fieldColumnState = this.gridColumnsService!.columnStates[fieldIndex];
                return (fieldColumnState && fieldColumnState.width) || unknown;
            }
        }
        return unknown;
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
                this.gridComponent.resize();
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

                        // ----------------------------

                        // after requesting data, setup fields
                        // establish templating views
                        this.fieldMetadataList.forEach((col: any) => {

                            if (!this.positionBasedTemplateMap.header[col.id]) {
                                this.positionBasedTemplateMap.header[col.id] = this.defaultHeaderTemplate; // default
                            }

                            if (!this.positionBasedTemplateMap.body[col.id]) {
                                this.positionBasedTemplateMap.body[col.id] = this.defaultBodyTemplate; // default
                            }
                        });

                        this._cd.detectChanges(); // gridComponent instance activated
                        this.gridComponent.resize();

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


    }


    //  occupies how much allotted space in the card, given there are other elements and constraints to consider?
    private calculateAvailableScrollHeightMetric(containerHeight: number): number {
        return (containerHeight - this._outlet.sumSectionsHeightExcept([this._element]));
    }


    // add decorative classes for fields
    private updateGridLayoutClasses() {
        const scrollableRegionSelector = ".datagrid";
        const columnStyle = this.componentSection.nativeElement.ownerDocument.createElement("style");
        this.scrollbarTrackerDimension = this.calculateScrollbarDimension();

        this._renderer.appendChild(this.componentSection.nativeElement, columnStyle);

        // various column alignments
        columnStyle.textContent = this.fieldMetadataList
            .filter((fieldMetadata) => !!fieldMetadata.layout)
            .map((fieldMetadata) => this.generateResourcePositionLayoutColumnClassCSS(fieldMetadata))
            .join("\n");

        // trace when datagrid is showing vertical scrollbar for many rows
        this.datagridLayoutElement = (this.gridComponentViewContainerRef.element.nativeElement! as HTMLElement).querySelector<HTMLElement>(scrollableRegionSelector);
        if (this.datagridLayoutElement) {

            const scrollResizeObserver = new ResizeObserver((entries, observer) => {
                const isHorizontalScrolled = this.datagridLayoutElement!.scrollWidth > this.datagridLayoutElement!.clientWidth;
                if (this.gridHorizontalScrollChange$.getValue() !== isHorizontalScrolled) {
                    this.gridHorizontalScrollChange$.next(isHorizontalScrolled);
                }

                const isVerticalScrolled = this.datagridLayoutElement!.scrollHeight > this.datagridLayoutElement!.clientHeight;
                if (this.gridVerticalScrollChange$.getValue() !== isVerticalScrolled) {
                    this.gridVerticalScrollChange$.next(isVerticalScrolled);
                }

            });
            scrollResizeObserver.observe(this.datagridLayoutElement);
            this.resizeObserverList.push(scrollResizeObserver);


            // sync scrolling
            this._zone.runOutsideAngular(() => this.datagridLayoutElement!.addEventListener("scroll", this.scrollDatagridEvent));
        }

        // if original datagrid has a scrollbar, then shift the margin in slightly
        this.assemblySubscriptionList.push(
            this.gridVerticalScrollChange$.pipe(debounceTime(1000)).subscribe((flag) => {
                this.syncDatagridOverflowDimension = flag ? this.scrollbarTrackerDimension : -1;
            }));


        // match width at all times
        const ro = new ResizeObserver((entries, observer) => {
            this.syncDatagridTableWidth = entries[0].contentRect.width;
            this.syncDatagridTableHeight = entries[0].contentRect.height;
            this._cd.detectChanges();
        });
        ro.observe(this.gridComponent.datagridTable.nativeElement);
        this.resizeObserverList.push(ro);


    }

    // DOM event listener
    private scrollDatagridEvent = (evt: Event) => {
        this.syncDatagridTableScrollLeft = (evt.target! as HTMLElement).scrollLeft;
        this._cd.detectChanges(); // debounce?
    };

    // "thickness" of a browser scrollbar tracker
    private calculateScrollbarDimension(): number {

        // Creating invisible container
        const outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.overflow = "scroll"; // forcing scrollbar to appear
        document.body.appendChild(outer);

        // Creating inner element and placing it in the container
        const inner = document.createElement("div");
        outer.appendChild(inner);

        // Calculating difference between container"s full width and the child width
        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        (outer.parentElement!).removeChild(outer); // DOM cleanup

        return scrollbarWidth;
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

}

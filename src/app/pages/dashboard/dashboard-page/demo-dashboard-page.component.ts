import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, take, tap } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DemoDashboardPageViewportPanService } from "./demo-dashboard-page-viewport-pan.service";
import { Observable, Subject, Subscription } from "rxjs";
import {
    DashboardConfigurationSchema,
    ViewAssemblyTypeStateResourceLayoutItemSchema
} from "ngx-card-deck";
import { DashboardComponent, GridContainerDashboardContainerComponent } from "ngx-card-deck";
import { PlatformCommunicatorBase } from "ngx-card-deck";
import { DeploymentConfigurationBase } from "ngx-card-deck";
import { DemoDashboardTransactionAgentService } from "./demo-dashboard-transaction-agent.service";
import { AppThemeService } from "../../../app-theme.service";

interface DemoAccountingViewAssemblyTypeStateResourceLayoutItemSchema {
    tracking: number;
    receivedDate: Date;
    layoutItem: ViewAssemblyTypeStateResourceLayoutItemSchema;
}

const resources = {
    form: {
        zoom: {default: 1, validation: {minimum: 0.2, maximum: 2.0}}
    },
    grid: {
        stateChangeCheckInterval: 10, // monitor grid state centrally
        backgroundMouseDraggable: false  // will background panning by mouse occur
    }
};


@Component({
    selector: 'demo-dashboard-page',
    templateUrl: './demo-dashboard-page.html',
    styleUrls: ['./demo-dashboard-page.scss', './grid-theme.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoDashboardPageComponent implements OnInit, AfterViewInit, OnDestroy {

    // diagramming with SVG
    @ViewChild("svgContainerHandle") svgContainerHandle: SVGSVGElement;

    @ViewChild("dashboardInstance") public dashboardInstance: DashboardComponent;
    @ViewChild("dashboardInstance", {read: ViewContainerRef}) public dashboardInstanceViewContainerRef: ViewContainerRef;

    // demo extension points: subview captured - loose coupling
    @ViewChild("canvasWidget", {read: ViewContainerRef}) canvasWidgetViewContainerRef: ViewContainerRef;

    // announce after changing zoom
    // tslint:disable-next-line:no-output-rename
    @Output("zoomLevelChange") zoomLevelChangeTransitionEnd$ = new EventEmitter<number>();
    // notify when dashboard project config metadata changes due to route switch
    // tslint:disable-next-line:no-output-rename
    @Output("dashboardConfiguration") dashboardConfiguration$ = new EventEmitter<DashboardConfigurationSchema>();

    /**
     * explore showing some debug about the state of cards on the deck
     * @type {Array<ViewAssemblyTypeStateResourceLayoutItemSchema>}
     */
    accountingJournalLayoutItemsChangeList: Array<Array<DemoAccountingViewAssemblyTypeStateResourceLayoutItemSchema>> = [];
    accountingJournalLayoutItemsTracking: number;

    isDebugMode = false;
    isActionToolbarMinimized = false;

    gridContainerAssemblyInstance: GridContainerDashboardContainerComponent;

    /**
     * dashboard and layout rules configurations -- sample mock
     */
    componentConfiguration: DashboardConfigurationSchema;
    routeOrganizerKey: string; // established organization used to determine which demo layout to embed

    routerSub: Subscription; // monitoring route changes, enter, switch between dashboards, completely leave
    debugForm: FormGroup;

    /**
     * signal assembly instance ready
     */
    gridContainerAssemblyInstanceInitialize$: Subject<GridContainerDashboardContainerComponent> = new Subject();

    themeChanges$: Observable<boolean>;
    /**
     * tracks each grid item placed onto the view initially
     */
    layoutItemInitialize$: Subject<ViewAssemblyTypeStateResourceLayoutItemSchema> = new Subject();
    // track user interaction triggers per item
    layoutItemStartMovementInteraction$: Subject<ViewAssemblyTypeStateResourceLayoutItemSchema> = new Subject();
    layoutItemEndMovementInteraction$: Subject<ViewAssemblyTypeStateResourceLayoutItemSchema> = new Subject();
    layoutItemDestroy$: Subject<ViewAssemblyTypeStateResourceLayoutItemSchema> = new Subject();
    layoutItemList: Array<ViewAssemblyTypeStateResourceLayoutItemSchema>;

    /**
     * all grid items have layouts ready
     */
    gridLayoutItemsInitialize$: Subject<Array<ViewAssemblyTypeStateResourceLayoutItemSchema>> = new Subject();

    /**
     * rebroadcast when user interaction changes grid layout state
     */
    gridLayoutItemsChangeList$: Subject<Array<ViewAssemblyTypeStateResourceLayoutItemSchema>> = new Subject();

    constructor(private fb: FormBuilder,
                private platformCommunicatorService: PlatformCommunicatorBase,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private elem: ElementRef,
                private panService: DemoDashboardPageViewportPanService,
                private cdr: ChangeDetectorRef,
                private themeService: AppThemeService,
                public demoTransaction: DemoDashboardTransactionAgentService,
                public environmentConfiguration: DeploymentConfigurationBase) {

        this.createForm();
        this.onReset();
    }

    get zoomConfiguration() {
        return resources.form.zoom;
    }

    get isDragging() {
        return this.panService.isDragging;
    }

    /**
     * deriving layout to position other nested content with respect to their containing grid
     */
    get gridWidgetBoundingClientRect(): ClientRect {
        return this.gridContainerAssemblyInstance
            ? this.gridContainerAssemblyInstance.gridWidget.el.getBoundingClientRect()
            : {};
    }

    get gridWidgetElement(): HTMLDivElement | null {
        const gcai = this.gridContainerAssemblyInstance;
        return gcai && gcai.gridWidget ? gcai.gridWidget.el : null;
    }

    public ngOnInit() {
        // route will provide data when the link resolves
        this.activatedRoute.data.pipe(tap((routeData) => this.provision(routeData))).subscribe();

        // strategy to detect enter and leave navigation
        this.routerSub = this.router.events.subscribe((evt) => {
            if (evt instanceof NavigationEnd) {
                //left view
            }
        });

    }

    public ngAfterViewInit() {
        if (resources.grid.backgroundMouseDraggable) {
            this.prepareMousePanningEvents();
        }
    }

    public ngOnDestroy() {
        this.cdr.detach();
        this.routerSub.unsubscribe();
    }

    /**
     * support swapping themes, to emulate dark/light modes. More variations possible by extending the SCSS
     * @param evt
     */
    onToggleTheme(evt: MouseEvent) {
        this.themeService.changeTheme(!this.themeService.themeStateFlag);
    }

    /**
     * capture emitted grid container when it is created
     */
    onGridContainerCreated(gridContainerAssembly: GridContainerDashboardContainerComponent) {
        this.layoutItemList = [];
        this.gridContainerAssemblyInstance = gridContainerAssembly;

        this.layoutItemInitialize$.pipe(take(this.gridContainerAssemblyInstance.assemblyState.materializedModelList.length)).subscribe(
            (layoutItem) => {
                this.layoutItemList.push(layoutItem);
            },
            () => {
            },
            () => {
                // when  all grid item entries have their layout initialized doesn't imply contents are viewable
                this.gridLayoutItemsInitialize$.next(this.layoutItemList);
            }
        );

        this.gridContainerAssemblyInstanceInitialize$.next(this.gridContainerAssemblyInstance);

        /*
        // track user interaction changes: when moving or resizing individual cards
        // Example of using a rudimentary poll-based alternative when emitters do not exist in library code
        const gw = gridContainerAssembly.gridWidget;
        this.gridLayoutItemMovementInteractionStateChange$ = this.gridChangeDetectionMonitor$.pipe(
            map(() => gw.dragInProgress),
            distinctUntilChanged(),
            // reveals which gridster item when it's being moved/resized
            map((flag) => (gw.dragInProgress && gw.movingItem)
                ? gw.grid.filter((item) => (item.$item.x === gw.movingItem!.x && item.$item.y === gw.movingItem!.y))[0]
                : null
            ),
            skip(1), // bypass initial
            share() // drag on/off stream to consumers
        );
        */
    }

    onLayoutItemInitialize(gridLayoutItem: ViewAssemblyTypeStateResourceLayoutItemSchema) {
        this.layoutItemInitialize$.next(gridLayoutItem);
    }

    // user interaction while dragging/resizing activities
    onLayoutItemStartMovementInteraction(gridLayoutItem: ViewAssemblyTypeStateResourceLayoutItemSchema) {
        this.layoutItemStartMovementInteraction$.next(gridLayoutItem);
    }

    onLayoutItemEndMovementInteraction(gridLayoutItem: ViewAssemblyTypeStateResourceLayoutItemSchema) {
        this.layoutItemEndMovementInteraction$.next(gridLayoutItem);
    }

    onLayoutItemDestroy(gridLayoutItem: ViewAssemblyTypeStateResourceLayoutItemSchema) {
        this.layoutItemDestroy$.next(gridLayoutItem);
    }

    /**
     * transform received set of layout changes into accounting record
     */
    onLayoutItemsChange(itemsChangeList: Array<ViewAssemblyTypeStateResourceLayoutItemSchema>) {
        const capturedDate = new Date(); // accounting
        const tracking = ++this.accountingJournalLayoutItemsTracking;

        this.accountingJournalLayoutItemsChangeList.unshift(itemsChangeList.map(i => ({
            tracking: tracking,
            receivedDate: capturedDate,
            layoutItem: i
        })));

        // regenerate grid change to child canvas
        this.gridLayoutItemsChangeList$.next(itemsChangeList);
    }

    // imperative addition of a card to private component collection after add workflow completes
    onGridLayoutItemAdd(newItem: ViewAssemblyTypeStateResourceLayoutItemSchema) {
        this.layoutItemList.push(newItem);
    }

    // imperative removal of a card from private component collection after removal workflow completes
    onGridLayoutItemRemove(removeItem: ViewAssemblyTypeStateResourceLayoutItemSchema) {
        this.layoutItemList.splice(this.layoutItemList.indexOf(removeItem), 1);
    }

    /**
     * clear the debug list
     */
    onReset() {
        this.accountingJournalLayoutItemsChangeList.length = 0;
        this.accountingJournalLayoutItemsTracking = 0;
    }

    // inform gridster directly. a bit low-level
    onZoomChangeEvent(zoomLevel: number) {
        this.onZoomCenterViewport(zoomLevel);
    }

    private onZoomCenterViewport(zoomLevel: number) {
        if (this.gridContainerAssemblyInstance) {
            const g = this.gridContainerAssemblyInstance.gridWidget;
            const zoomChange = zoomLevel / g.scalerLevel;

            setTimeout(() => {
                // safe apply after transitionend
                g.el.scrollLeft *= zoomChange;
                g.el.scrollTop *= zoomChange;
                this.cdr.markForCheck();
                this.zoomLevelChangeTransitionEnd$.next(zoomChange);
            }, this.gridContainerAssemblyInstance.transitionDuration);
        }
    }

    /**
     * prepare configuration by loading it over network or cache. Depends on CompanySample2DashboardConfigurationsCache
     * component destroy is not called by design because the router will recycle this class between similar routes
     */
    private provision(routeExposedParameters: Data) {
        this.routeOrganizerKey = this.activatedRoute.snapshot.params.organizer;
        this.componentConfiguration = routeExposedParameters.configuration;
        this.accountingJournalLayoutItemsChangeList.length = 0;
        this.dashboardConfiguration$.next(this.componentConfiguration);

        this.cdr.markForCheck();
    }

    /**
     *  mouse drag background to move entire canvas project around to some preferred area
     */
    private prepareMousePanningEvents() {
        this.panService.cleanupMouseEvents(this.dashboardInstanceViewContainerRef.element.nativeElement);
        this.panService.setDashboardViewportPage(this);
        this.panService.prepareMouseEvents(this.dashboardInstanceViewContainerRef.element.nativeElement);
    }


    /**
     * initialize form and reactive event to zoom slider
     */
    private createForm() {

        this.themeChanges$ = this.themeService.onChange$();

        this.demoTransaction.setComponent(this);

        this.debugForm = this.fb.group({
            zoom: [resources.form.zoom.default, [
                <any>Validators.min(this.zoomConfiguration.validation.minimum),
                <any>Validators.max(this.zoomConfiguration.validation.maximum)
            ]],


        });

        this.debugForm.get("zoom")!.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => this.onZoomChangeEvent(value));
    }

}


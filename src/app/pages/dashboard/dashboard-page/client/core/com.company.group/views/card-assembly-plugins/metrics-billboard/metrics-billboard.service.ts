import { ComponentFactoryResolver, forwardRef, Inject, Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { MetricsBillboardDataRecordEntitySchema } from "./metrics-billboard.interface";
import { map, share } from "rxjs/operators";
import {
    CardPluginBaseClassService,
    TemplateTransporterService
} from "ngx-card-deck";
import { OrganizerPackageEnumerationBase } from "ngx-card-deck";
import {
    CardOutletExtensionViewRender,
    DashboardCardDataGridReadable,
    DashboardGridDataReaderResponseDeliverable
} from "ngx-card-deck";
import { CARD_OUTLET_COMPONENTS_CONFIG_TOKEN } from "ngx-card-deck";
import {
    DashboardAssemblyLayoutState,
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";


@Injectable()
export class MetricsBillboardService<T> extends CardPluginBaseClassService<T> implements DashboardCardDataGridReadable<T> {

  private internalOrganizersList: Array<OrganizerPackageEnumerationBase>;


  constructor(@Inject(forwardRef(() => CARD_OUTLET_COMPONENTS_CONFIG_TOKEN)) private staticConfigurationList: Array<CardOutletExtensionViewRender<any>>,
              protected _templateTransporter: TemplateTransporterService,
              protected compResolver: ComponentFactoryResolver,
              protected _injector: Injector) {
    super(_injector);

    this.initialize();
  }


  // network service fetch and data assembly
  streamInitialDataModel(dcrf: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                         dashboardFacade: DashboardComponent): Observable<DashboardGridDataReaderResponseDeliverable<T>> {

    const dals = dcrf.resolver.injectorInstance.state() as DashboardAssemblyLayoutState;
    const serviceResourceFacade = dals.findConfigurationResourceByType("modulesList", "service")!;

    const o$ = this._templateTransporter.awaitingResourceStream(serviceResourceFacade).pipe(
      map((d: boolean) => {
        const entity: MetricsBillboardDataRecordEntitySchema = serviceResourceFacade.resolver.getSnapshotData();
        return {response: {entity: entity}};
      }),
      share());

    return o$;
  }


  // map which component to show
  private initialize() {

    // setup internal defaults
    this.internalOrganizersList = [OrganizerPackageEnumerationBase.internal];
    // rule: is internal
    const isInternallyOrganizedLambda = (o: CardOutletExtensionViewRender<any>) => (this.internalOrganizersList.indexOf(o.organizerPackage) >= 0);

    // extract permitted and resolved team templates
    this.staticConfigurationList
      .filter((o) => !isInternallyOrganizedLambda(o))
      .forEach((o) => this.templatableClassesListMap!.set(o.identifier, o.resolveTemplatableClassesList!)); // enforced
  }

}


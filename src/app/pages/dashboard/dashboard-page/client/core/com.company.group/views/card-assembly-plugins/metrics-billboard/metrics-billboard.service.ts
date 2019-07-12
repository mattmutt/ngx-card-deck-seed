import { ComponentFactoryResolver, forwardRef, Inject, Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { CARD_OUTLET_COMPONENTS_CONFIG_TOKEN } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import {
    DashboardAssemblyLayoutState,
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { TemplateTransporterService } from "ngx-card-deck";
import {
    CardOutletExtensionViewRender,
    DashboardGridDataReaderResponseDeliverable
} from "ngx-card-deck";
import { StandardCardPluginServiceBase } from "../../../../../common/standard/card-outlet/card-assembly-plugins/base/standard-card-plugin-service-base";
import { MetricsBillboardDataRecordEntitySchema } from "./metrics-billboard.interface";
import { MetricsBillboardDataModel } from "./metrics-billboard.model";


@Injectable()
export class MetricsBillboardService<T extends MetricsBillboardDataModel> extends StandardCardPluginServiceBase<T> {

    constructor(@Inject(forwardRef(() => CARD_OUTLET_COMPONENTS_CONFIG_TOKEN)) protected staticConfigurationList: Array<CardOutletExtensionViewRender<any>>,
                protected _templateTransporter: TemplateTransporterService,
                protected compResolver: ComponentFactoryResolver,
                protected _injector: Injector) {
        super(_injector);
        super.initialize();
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


}


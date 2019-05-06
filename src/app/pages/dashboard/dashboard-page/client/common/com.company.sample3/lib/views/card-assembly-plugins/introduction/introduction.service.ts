import { ComponentFactoryResolver, forwardRef, Inject, Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { filter, map, share } from "rxjs/operators";
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
import { StandardCardPluginServiceBase } from "../../../../../standard/card-outlet/card-assembly-plugins/base/standard-card-plugin-service-base";
import { IntroductionDataModel } from "./introduction.model";


@Injectable({providedIn: "root"})
export class IntroductionService<T extends IntroductionDataModel> extends StandardCardPluginServiceBase<T> {

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

        // when the asynchronous data is noted as ready for further processing
        return this._templateTransporter.awaitingResourceStream(serviceResourceFacade).pipe(
            filter((ready) => ready),
            map(() => ({response: {entity: serviceResourceFacade.resolver.getSnapshotData()}} as IntroductionDataModel)),
            share());

    }

}


import { Observable, of } from "rxjs";
import { CardPluginBaseClassService } from "ngx-card-deck";
import {
    CardOutletExtensionViewRender,
    DashboardCardDataReadable,
    DashboardDataReaderResponseDeliverable
} from "ngx-card-deck";
import { OrganizerPackageEnumerationBase } from "ngx-card-deck";
import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";


export abstract class StandardCardPluginServiceBase<T> extends CardPluginBaseClassService<T> implements DashboardCardDataReadable<T> {

    // injected from subclass
    protected staticConfigurationList: Array<CardOutletExtensionViewRender<any>>;
    protected internalOrganizersList: Array<OrganizerPackageEnumerationBase>;

    // subclass can define fetch and data assembly
    streamInitialDataModel(dcrf: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema,
                               DashboardConfigurationResourceCardSchema>,
                           dashboardFacade: DashboardComponent): Observable<DashboardDataReaderResponseDeliverable<T>> {
        return of({});
    }

    protected initialize() {

        // setup internal defaults
        this.internalOrganizersList = [OrganizerPackageEnumerationBase.internal];
        // rule: is internal
        const isInternallyOrganizedLambda = (o: CardOutletExtensionViewRender<any>) =>
            this.internalOrganizersList.indexOf(o.organizerPackage) >= 0;

        // extract permitted and resolved team templates
        this.staticConfigurationList
            .filter((o) => !isInternallyOrganizedLambda(o))
            .forEach((o) => this.templatableClassesListMap!.set(o.identifier, o.resolveTemplatableClassesList!));
    }

}


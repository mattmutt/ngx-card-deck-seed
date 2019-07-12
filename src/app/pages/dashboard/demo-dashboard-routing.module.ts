import { Inject, Injectable, NgModule } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Route, RouterModule, RouterStateSnapshot, Routes } from "@angular/router";
import { Observable } from "rxjs";
import { DemoDashboardPageComponent } from "./dashboard-page/demo-dashboard-page.component";
import { DemoDashboardOrganizerPackageEnumeration } from "./dashboard-page/integration/card-outlet/demo-dashboard-organizer-package.class";
import { DemoDashboardDeploymentConfigurationService } from "./dashboard-page/integration/environment/demo-dashboard-deployment-configuration.service";
import { DemoDashboardGlobalStateService } from "./dashboard-page/integration/environment/demo-dashboard-global-state.service";
import { DemoDashboardUserLocaleEntity } from "./dashboard-page/integration/environment/demo-dashboard-business-context-entity.state.interface";
import { DemoDashboardComponent } from "./demo-dashboard.component";
import { DashboardConfigurationSchema } from "ngx-card-deck";
import { DeploymentConfigurationBase, GlobalStateBase } from "ngx-card-deck";
import { DashboardService } from "ngx-card-deck";


const resources = {
    route: {
        organizerPropertyName: "organizer",
        configurationPropertyName: "configuration"
    }
};

// Route determined by path property "configuration"
@Injectable()
export class DemoDashboardRouting implements Resolve<DashboardConfigurationSchema> {

    constructor(@Inject(GlobalStateBase) private demoState: DemoDashboardGlobalStateService,
                @Inject(DeploymentConfigurationBase) private demoConfiguration: DemoDashboardDeploymentConfigurationService,
                private service: DashboardService) {
    }

    resolve<T>(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DashboardConfigurationSchema> {

        // setup session and extensible tree metadata
        // this.service.observeUserSession();

        const userLocale: DemoDashboardUserLocaleEntity = {
            language: "en_US", // engine requirement. Ensure to formally retrieve via official APIs

            // demo purposes: think about adding some degree of localization
            timezone: "America/Los_Angeles",
            country: "US",
            browser: navigator.vendor
        };

        // ------- define app -------
        this.demoState.userLocale = userLocale;
        this.demoState.businessStateContext = {};  // supply externalized references to important state outside the dashboard
        this.demoState.selectedOrganizerEnumerationKey = DemoDashboardOrganizerPackageEnumeration[route.paramMap.get(resources.route.organizerPropertyName) as keyof DemoDashboardOrganizerPackageEnumeration];

        return this.service.streamConfigurationMetadata(route.paramMap.get(resources.route.organizerPropertyName)!, route.paramMap.get(resources.route.configurationPropertyName)!);

        // await session
        // return this.service.observeUserSession().flatMap(() => this.service.streamConfigurationMetadata(route.paramMap.get("organizer")!, route.paramMap.get("configuration")!);
    }
}


// scalability: tooling builds lazily-loaded view inside the widget as split chunk
export const demoModuleRouteMap: { [identifier: string]: Route } = {
    demoClientMetricsBillboard: {
        outlet: "DemoClientMetricsBillboard",

        // Angular 8 syntax
        loadChildren: () => import( "./dashboard-page/client/common/com.company.sample1/views/card-templates/components/demo-client-metrics-billboard/demo-client-metrics-billboard-template.module")
           .then(m => m.DemoClientMetricsBillboardTemplateModule)

        // loadChildren: "./dashboard-page/client/common/com.company.sample1/views/card-templates/components/demo-client-metrics-billboard/demo-client-metrics-billboard-template.module#DemoClientMetricsBillboardTemplateModule"
    }
};

export const demoDashboardRoutes: Routes = [
    {
        path: "",
        component: DemoDashboardComponent,
        children: [
            {
                path: "dashboard-page/:organizer/:configuration",
                component: DemoDashboardPageComponent,
                resolve: {configuration: DemoDashboardRouting},
                children: [demoModuleRouteMap.demoClientMetricsBillboard]
            }

        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(demoDashboardRoutes)],
    providers: [DemoDashboardRouting],
    exports: [RouterModule]
})
export class DemoDashboardRoutingModule {
}


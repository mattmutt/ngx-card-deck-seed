import { NgModule, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { DemoDashboardPageComponent } from './dashboard-page/demo-dashboard-page.component';
import { DemoDashboardOutletSharedProviderModule } from "./dashboard-page/integration/card-outlet/demo-dashboard-outlet-shared-provider.module";
import { DemoDashboardDeploymentConfigurationService } from './dashboard-page/integration/environment/demo-dashboard-deployment-configuration.service';
import { DemoDashboardGlobalStateService } from './dashboard-page/integration/environment/demo-dashboard-global-state.service';
import { DemoDashboardModuleIntegrationTokenService } from "./dashboard-page/integration/platform/demo-dashboard-module-integration-token.service";
import { DemoDashboardPlatformCommunicatorService } from './dashboard-page/integration/platform/demo-dashboard-platform-communicator.service';
import { DemoAppSessionObserverService } from './dashboard-page/client/core/com.company.group/lib/services/sample-product/platform/demo-app-session-observer.service';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { DemoDashboardRoutingModule } from "./demo-dashboard-routing.module";
import { DemoDashboardComponent } from "./demo-dashboard.component";
import { DemoDashboardPageViewportPanService } from "./dashboard-page/demo-dashboard-page-viewport-pan.service";
import { DashboardModule } from "ngx-card-deck";
import { ModuleIntegrationTokenBase, PlatformCommunicatorBase } from "ngx-card-deck";
import { DeploymentConfigurationBase, GlobalStateBase } from "ngx-card-deck";
import { DemoDashboardTransactionAgentService } from "./dashboard-page/demo-dashboard-transaction-agent.service";

@NgModule({

    imports: [
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule,
        DemoDashboardRoutingModule,
        DemoDashboardOutletSharedProviderModule,
        DashboardModule,
    ],

    providers: [
        DemoAppSessionObserverService,
        // demo card service providers
        DemoDashboardGlobalStateService,
        DemoDashboardDeploymentConfigurationService,
        DemoDashboardPageViewportPanService,
        DemoDashboardTransactionAgentService,

        // client configuration and integration dependencies
        {
            provide: ModuleIntegrationTokenBase,
            useClass: DemoDashboardModuleIntegrationTokenService,
            deps: []
        },

        // sourced metamodel feed
        {
            provide: DeploymentConfigurationBase,
            useExisting: DemoDashboardDeploymentConfigurationService,
            deps: []
        },

        // build time structure and rules
        {
            provide: GlobalStateBase,
            useExisting: DemoDashboardGlobalStateService,
            deps: [NgZone, DemoAppSessionObserverService, DeploymentConfigurationBase]
        },

        // platform services
        {
            provide: PlatformCommunicatorBase,
            useClass: DemoDashboardPlatformCommunicatorService,
            deps: [
                HttpClient,
                DemoDashboardGlobalStateService,
                DemoDashboardDeploymentConfigurationService
            ]
        },

    ],

    declarations: [DemoDashboardComponent, DemoDashboardPageComponent],

    exports: [DemoDashboardComponent]

})
export class DemoDashboardModule {
}


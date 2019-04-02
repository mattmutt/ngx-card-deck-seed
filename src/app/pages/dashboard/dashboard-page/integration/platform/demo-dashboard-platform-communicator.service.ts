import { Inject, Injectable } from "@angular/core";
import { DemoDashboardDeploymentConfigurationService } from "../environment/demo-dashboard-deployment-configuration.service";
import { DemoDashboardGlobalStateService } from "../environment/demo-dashboard-global-state.service";
import { HttpClient } from "@angular/common/http";
import { PlatformCommunicatorBase } from "ngx-card-deck";
import { DeploymentConfigurationBase, GlobalStateBase } from "ngx-card-deck";

@Injectable()
export class DemoDashboardPlatformCommunicatorService extends PlatformCommunicatorBase {

   constructor(protected _http: HttpClient,
               @Inject(GlobalStateBase) protected _appGlobalState: DemoDashboardGlobalStateService,
               @Inject(DeploymentConfigurationBase) protected _deploymentConfiguration: DemoDashboardDeploymentConfigurationService) {
      super();

   }

   // strictness
   getDeploymentConfiguration(): DemoDashboardDeploymentConfigurationService {
      // super.getDeploymentConfiguration() as DemoDashboardDeploymentConfigurationService;
      return this._deploymentConfiguration;
   }

   getGlobalState(): DemoDashboardGlobalStateService {
      // super.getGlobalState() as DemoDashboardGlobalStateService;
      return this._appGlobalState;
   }


   // extend custom ingest via `streamRestResource()`

}

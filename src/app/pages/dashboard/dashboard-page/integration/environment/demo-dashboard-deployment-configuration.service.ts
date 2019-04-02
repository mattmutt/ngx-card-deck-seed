import { Injectable } from "@angular/core";
import { environment } from "../../../../../../environments/environment";
import {
    DeploymentConfigurationBase,
    EnvironmentConfigurationSchema
} from "ngx-card-deck";

@Injectable()
export class DemoDashboardDeploymentConfigurationService extends DeploymentConfigurationBase {

   // supply integration layer
   constructor(

   ) {
      // provisioned via angular-cli build
      super((<any> environment.modules["demo-dashboard"].configuration.environment) as EnvironmentConfigurationSchema);
   }

}

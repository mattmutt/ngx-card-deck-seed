import { Observable, of } from "rxjs";
// -- statically configuration at build time
import * as journal1Configuration from "../../../../../../../../../../../mock/network/vendors/extension/com.company.sample1/metadata/dashboard/configurations/journal1.json";
import * as journal2Configuration from "../../../../../../../../../../../mock/network/vendors/extension/com.company.sample1/metadata/dashboard/configurations/journal2.json";
import { tap } from "rxjs/operators";
import {
    DashboardConfigurationSchema,
    DashboardConfigurationSchemaFileFetchable
} from "ngx-card-deck";
import { PlatformCommunicatorBase } from "ngx-card-deck";
import { EnvironmentConfigurationItemSchema } from "ngx-card-deck";

const cache = {
    "journal1": journal1Configuration.default,
    "journal2": journal2Configuration.default
    //   "journal3": journal3Configuration 3 - on demand
};


// how to locate configurations
export class CompanySample1DashboardConfigurationsCache implements DashboardConfigurationSchemaFileFetchable {

    // implementation for retrieving the configuration from disk/cache
    public fetchConfigurationSchemaResource$(configId: string, platformCommunicatorService: PlatformCommunicatorBase): Observable<DashboardConfigurationSchema> {

        /*
       Demonstrates cache disabled for the dashboard initial configuration
       Replace a pre-filled cache to enable a configuration at build time
       */

        const cacheResource = cache[configId];

        // extract from cache
        if (cacheResource) {
            return of(cacheResource);
        } else {

            const configurationServiceRequest = {
                method: "GET",
                path: "configurations"
            };

            const dashEnvConfig: EnvironmentConfigurationItemSchema = platformCommunicatorService.getDeploymentConfiguration().dashboardMetadata;

            // network fetch
            // establish relationship to selected report kept by the session
            const o$: Observable<DashboardConfigurationSchema> = platformCommunicatorService.streamRestResource(
                configurationServiceRequest.method,
                `${configurationServiceRequest.path}/${configId}`,
                dashEnvConfig, platformCommunicatorService.getGlobalState().deriveRouteAccessor());


            o$.pipe(tap((data: any) => {
                cache[configId] = data;
            }));


            return o$;
        }
    }

}

import { Observable, of } from "rxjs";
// -- statically configuration at build time
import * as simpleDeck3Configuration from "../../../../../../../../../../../mock/network/vendors/extension/com.company.sample3/metadata/dashboard/configurations/deck3.json";


import { map, tap } from "rxjs/operators";
import {
    DashboardConfigurationSchema,
    DashboardConfigurationSchemaFileFetchable,
    SimpleInlineConfigurationSchema, transformerAction
} from "ngx-card-deck";
import { PlatformCommunicatorBase } from "ngx-card-deck";
import { EnvironmentConfigurationItemSchema } from "ngx-card-deck";

const cache = {
    //   "journal3": journal3Configuration 3 - on demand
    "deck3": transformerAction(simpleDeck3Configuration.default)
};


// how to locate configurations
export class CompanySample3DashboardConfigurationsCache implements DashboardConfigurationSchemaFileFetchable {

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
            const o$: Observable<SimpleInlineConfigurationSchema> = platformCommunicatorService.streamRestResource(
                configurationServiceRequest.method,
                `${configurationServiceRequest.path}/${configId}`,
                dashEnvConfig, platformCommunicatorService.getGlobalState().deriveRouteAccessor());

            return o$.pipe(
                tap((data) => {
                    cache[configId] = data; // pre-processor and simplify
                }),
                map((simpleConfig) => transformerAction(simpleConfig))
            );

        }

    }

}

import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { nodeflowConfigSchemaTransformerAction } from "../../models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.class";
import {
    DashboardConfigurationSchema,
    DashboardConfigurationSchemaFileFetchable
} from "ngx-card-deck";
import { PlatformCommunicatorBase } from "ngx-card-deck";
import { EnvironmentConfigurationItemSchema } from "ngx-card-deck";

// example
import * as simpleDeck3Configuration from "../../../metadata/configurations/deck3.json";
import * as simpleDeck4Configuration from "../../../metadata/configurations/deck4.json";

// -- statically configuration at build time
// import * as deck1Configuration from "../../../../../../../../../../../mock/network/vendors/extension/com.company.sample2/metadata/dashboard/configurations/deck1.json";
// import * as deck2Configuration from "../../../../../../../../../../../mock/network/vendors/extension/com.company.sample2/metadata/dashboard/configurations/deck2.json";


const cache = {
    // "deck1": deck1Configuration,
    // "deck2": deck2Configuration,

    // nodeflow decks : configurator processor
    "deck3": nodeflowConfigSchemaTransformerAction(simpleDeck3Configuration.default),
    "deck4": nodeflowConfigSchemaTransformerAction(simpleDeck4Configuration.default)
};

// how to locate sample configurations
export class NodeflowDashboardConfigurationsCache implements DashboardConfigurationSchemaFileFetchable {

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

            o$.pipe(tap((data) => {
                cache[configId] = data;
            }));


            return o$;
        }
    }

}


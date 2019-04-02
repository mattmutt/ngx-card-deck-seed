import * as DemoDashboardMetadataConfiguration from "../../config/deployments/production/environment.json";

export const environment = {
   production: true,

   modules: {
      // initial paths relevant watch mode
      "demo-dashboard": {
         configuration: {
            environment: DemoDashboardMetadataConfiguration.default
         }

      }

   }

};


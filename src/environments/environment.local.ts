import * as DemoDashboardMetadataConfiguration from "../../config/deployments/local/environment.json";

export const environment = {
   production: false,

   modules: {
      // initial paths relevant watch mode
      "demo-dashboard": {
         configuration: {
            environment: DemoDashboardMetadataConfiguration.default
         }

      }

   }

};


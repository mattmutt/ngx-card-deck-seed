import * as DemoDashboardMetadataConfiguration from "../../config/deployments/github-pages/environment.json";

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


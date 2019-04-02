import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DEMO_CONFIG_STATIC_INTEGRATION } from "../platform/demo-dashboard-module-integration-token.service";
import {
    CARD_OUTLET_COMPONENTS_CONFIG_TOKEN,
    defaultAllocatedCardOutletExtensionViewRenderDefinitionsList
} from "ngx-card-deck";
import { CardOutletService } from "ngx-card-deck";

// Demo version - CardOutletProviderSharedModule
// provision custom integration dependencies for dashboard engine to use for the view
// shared between external consumer project and internal engine
@NgModule({

   imports: [
      CommonModule,
      // client code
      ...DEMO_CONFIG_STATIC_INTEGRATION.getAllocatedModulesList()
   ],

   entryComponents: [
      ...DEMO_CONFIG_STATIC_INTEGRATION.getAllocatedComponentsList()
   ],

   declarations: [

      // client code
      ...DEMO_CONFIG_STATIC_INTEGRATION.getAllocatedComponentsList(),
      ...DEMO_CONFIG_STATIC_INTEGRATION.getAllocatedDirectivesList()
   ],

   providers: [
      // ------- configurable phase
      {
         provide: CARD_OUTLET_COMPONENTS_CONFIG_TOKEN,
         useValue: [...DEMO_CONFIG_STATIC_INTEGRATION.allocatedCardOutletExtensionViewRenderDefinitionsList, ...defaultAllocatedCardOutletExtensionViewRenderDefinitionsList]
      },

      {
         provide: CardOutletService,
         useClass: CardOutletService,
         deps: [CARD_OUTLET_COMPONENTS_CONFIG_TOKEN] // actual config token must be provided in the enclosing module
      },
      // ------- /configurable phase

      // client code
      ...DEMO_CONFIG_STATIC_INTEGRATION.getAllocatedServicesList()
   ]

})
export class DemoDashboardOutletSharedProviderModule {

   constructor() {
   }

}


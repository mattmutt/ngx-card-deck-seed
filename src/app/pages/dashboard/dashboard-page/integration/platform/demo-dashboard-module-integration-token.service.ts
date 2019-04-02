import { Injectable, NgModule, Type } from "@angular/core";
import {
    demoDashboardAllocatedCardOutletExtensionViewRenderDefinitionsList,
    demoGetAllocatedComponentsList,
    demoGetAllocatedDirectivesList,
    demoGetAllocatedModulesList,
    demoGetAllocatedServicesList
} from "../card-outlet/demo-dashboard-card-outlet-render-definitions.class";
import {
    DemoDashboardOrganizerPackageEnumeration,
    getOrganizerPackageKey
} from "../card-outlet/demo-dashboard-organizer-package.class";
import { DemoDashboardDeploymentConfigurationService } from "../environment/demo-dashboard-deployment-configuration.service";
import { DemoDashboardOrganizerConfiguration } from "../environment/demo-dashboard-organizer-configuration.class";
import { demoDashboardResolverAgentClassMap } from "../resolvers/demo-dashboard-resolver-collaborators.class";
import { demoDashboardVendorClassificationMap } from "../card-outlet/demo-dashboard-vendor-classification.class";
import {
    DashboardCardPluggable,
    ServiceRenderClass
} from "ngx-card-deck";
import { ModuleIntegrationTokenBase } from "ngx-card-deck";

/**
 * serves as complete package of the build time dependencies that get delivered to the `CardOutletModule`
 */

export const DEMO_CONFIG_OCS = new DemoDashboardOrganizerConfiguration();

export function DEMO_CONFIG_OCS_FUNCTION(): DemoDashboardOrganizerConfiguration {
   return DEMO_CONFIG_OCS;
}

export const DEMO_CONFIG_CCDCS = new DemoDashboardDeploymentConfigurationService();

export function DEMO_CONFIG_CDCS_FUNCTION(): DemoDashboardDeploymentConfigurationService {
   return DEMO_CONFIG_CCDCS;
}

export function DEMO_CONFIG_ADL(): Array<Type<any>> {
   return demoGetAllocatedDirectivesList();
}

export function DEMO_CONFIG_ASL(): Array<ServiceRenderClass<any>> {
   return demoGetAllocatedServicesList();
}

export function DEMO_CONFIG_ACL(): Array<Type<DashboardCardPluggable<any>>> {
   return demoGetAllocatedComponentsList();
}

export function DEMO_CONFIG_AML(): Array<Type<NgModule>> {
   return demoGetAllocatedModulesList();
}

export const DEMO_CONFIG_STATIC_INTEGRATION: ModuleIntegrationTokenBase = {
   resolverAgentClassMap: demoDashboardResolverAgentClassMap,
   vendorClassificationMap: demoDashboardVendorClassificationMap,
   allocatedCardOutletExtensionViewRenderDefinitionsList: demoDashboardAllocatedCardOutletExtensionViewRenderDefinitionsList,
   organizerPackageEnumeration: DemoDashboardOrganizerPackageEnumeration,

   // must be function
   getOrganizerConfigurationService: DEMO_CONFIG_OCS_FUNCTION,
   getDashboardDeploymentConfigurationService: DEMO_CONFIG_CDCS_FUNCTION,

   getOrganizerPackageKey: getOrganizerPackageKey, // alias
   getAllocatedDirectivesList: DEMO_CONFIG_ADL,
   getAllocatedServicesList: DEMO_CONFIG_ASL,
   getAllocatedComponentsList: DEMO_CONFIG_ACL,
   getAllocatedModulesList: DEMO_CONFIG_AML
};


// services within core engine receive injected
@Injectable()
export class DemoDashboardModuleIntegrationTokenService extends ModuleIntegrationTokenBase {
   resolverAgentClassMap = demoDashboardResolverAgentClassMap;
   vendorClassificationMap = demoDashboardVendorClassificationMap;
   allocatedCardOutletExtensionViewRenderDefinitionsList = demoDashboardAllocatedCardOutletExtensionViewRenderDefinitionsList;
   organizerPackageEnumeration = DemoDashboardOrganizerPackageEnumeration;

   getOrganizerConfigurationService() {
      return DEMO_CONFIG_OCS; // memoized
   }

   getDashboardDeploymentConfigurationService() {
      return DEMO_CONFIG_CCDCS; // memoized
   }

   getOrganizerPackageKey(key: any) {
      return getOrganizerPackageKey(key);
   }

   getAllocatedDirectivesList() {
      return demoGetAllocatedDirectivesList();
   }

   getAllocatedServicesList() {
      return demoGetAllocatedServicesList();
   }

   getAllocatedComponentsList() {
      return demoGetAllocatedComponentsList();
   }

   getAllocatedModulesList() {
      return demoGetAllocatedModulesList();
   }

}


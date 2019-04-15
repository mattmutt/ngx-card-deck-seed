import {
    DemoDashboardOrganizerPackageEnumeration,
    getOrganizerPackageKey as demoGetOrganizerPackageKey
} from "../card-outlet/demo-dashboard-organizer-package.class";
import { CompanySample1DashboardConfigurationsCache } from "../../client/common/com.company.sample1/lib/services/dashboard/configurations-cache";
import { CompanySample3DashboardConfigurationsCache } from "../../client/common/com.company.sample3/lib/services/dashboard/configurations-cache";
import { NodeflowDashboardConfigurationsCache } from "../../client/organizers/nodeflow/lib/services/dashboard/configurations-cache";
import { ContainerOrganizerConfigurable } from "ngx-card-deck";
import { DashboardConfigurationSchemaFileFetchable } from "ngx-card-deck";
import {
    getOrganizerPackageKey as standardGetOrganizerPackageKey,
    StandardDashboardOrganizerPackageEnumeration
} from "../../client/common/standard/organizer/standard-dashboard-organizer-package.class";


// ~~~~~~~~~~~ demonstration of vendor organizations to support multi-tenant dashboard ~~~~~~~~~~~
export class DemoDashboardOrganizerConfiguration implements ContainerOrganizerConfigurable {

    // cached resources
    public configurationSchemaFileFetchMap: Map<string, DashboardConfigurationSchemaFileFetchable> = new Map();

    constructor() {

        // ~~~~~~~~~~~~~~ component definitions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // has to be serialized string upfront
        this.configurationSchemaFileFetchMap.set(demoGetOrganizerPackageKey(DemoDashboardOrganizerPackageEnumeration.com_company_sample2), new CompanySample1DashboardConfigurationsCache());

        // company sample 3 illustrates the simple care preprocessor metadata transformer
        this.configurationSchemaFileFetchMap.set(demoGetOrganizerPackageKey(DemoDashboardOrganizerPackageEnumeration.com_company_sample3), new CompanySample3DashboardConfigurationsCache());

        // ~~~~~~~~~~~~~~ Sample component definitions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // - Sample Extension set
        this.configurationSchemaFileFetchMap.set(standardGetOrganizerPackageKey(StandardDashboardOrganizerPackageEnumeration.nodeflow), new NodeflowDashboardConfigurationsCache());

    }

}

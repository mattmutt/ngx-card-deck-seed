import { StandardDashboardOrganizerPackageEnumeration } from "../organizer/standard-dashboard-organizer-package.class";
import { StandardDashboardVendorClassificationMap } from "./standard-dashboard-card-outlet-render-definitions.interface";

export const standardDashboardVendorClassificationMap: StandardDashboardVendorClassificationMap = {

    // Journal 2 represents the second dashboard view created under the vendor
    'nodeflow_sample': {
        organizerPackage: StandardDashboardOrganizerPackageEnumeration.nodeflow,
        organization: 'nodeflow_sample', // per card metadata "templates > body > organization"
        description: 'Node flow sample group 1'
    }

};


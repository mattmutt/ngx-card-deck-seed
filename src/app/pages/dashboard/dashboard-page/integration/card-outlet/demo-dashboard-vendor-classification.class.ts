// multiple groups within the vendors supported
import { DemoDashboardVendorClassificationMap } from "./demo-dashboard-card-outlet-render-definitions.interface";
import { DemoDashboardOrganizerPackageEnumeration } from "./demo-dashboard-organizer-package.class";

export const demoDashboardVendorClassificationMap: DemoDashboardVendorClassificationMap = {
    // 0 represents contributor's framework
    '0': {
        organizerPackage: DemoDashboardOrganizerPackageEnumeration.com_company_acme_shared_library,
        organization: 'acme-framework',
        description: 'framework supplier'
    },
    // Journal 1 represents the first dashboard view created under the vendor
    '1': {
        organizerPackage: DemoDashboardOrganizerPackageEnumeration.com_company_sample1,
        organization: 'project1',
        description: 'Sample testing dashboard #1 - 5 grid elements'
    },
    // Journal 2 represents the second dashboard view created under the vendor
    '2': {
        organizerPackage: DemoDashboardOrganizerPackageEnumeration.com_company_sample1,
        organization: 'project2',
        description: 'Sample testing dashboard #2 - 1 summary billboard'
    },

};


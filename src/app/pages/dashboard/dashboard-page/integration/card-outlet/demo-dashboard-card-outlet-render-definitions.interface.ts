import { DemoDashboardOrganizerPackageEnumeration } from "./demo-dashboard-organizer-package.class";
import {
    CardOutletExtensionViewRender,
    VendorClassificationItem,
    VendorClassificationMap
} from "ngx-card-deck";
import { OrganizerPackageEnumerationBase } from "ngx-card-deck";
import { StandardDashboardOrganizerPackageEnumeration } from "../../client/common/standard/organizer/standard-dashboard-organizer-package.class";


export interface DemoDashboardCardOutletExtensionViewRender<T> extends CardOutletExtensionViewRender<T> {
    organizerPackage: DemoDashboardOrganizerPackageEnumeration | StandardDashboardOrganizerPackageEnumeration | OrganizerPackageEnumerationBase;
}

export interface DemoDashboardVendorClassificationItem extends VendorClassificationItem {
    organizerPackage: DemoDashboardOrganizerPackageEnumeration | StandardDashboardOrganizerPackageEnumeration | OrganizerPackageEnumerationBase;
}


/* used in card outlet render definitions */
export interface DemoDashboardVendorClassificationMap extends VendorClassificationMap {

    // recommended safety - provide known template classifications
    0: DemoDashboardVendorClassificationItem;
    1: DemoDashboardVendorClassificationItem;
    2: DemoDashboardVendorClassificationItem;
    nodeflow_sample: DemoDashboardVendorClassificationItem;

    [identifier: string]: DemoDashboardVendorClassificationItem;
}



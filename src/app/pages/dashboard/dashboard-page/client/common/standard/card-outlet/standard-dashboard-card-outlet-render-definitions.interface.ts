import {
    CardOutletExtensionViewRender,
    VendorClassificationItem,
    VendorClassificationMap
} from "ngx-card-deck";
import { StandardDashboardOrganizerPackageEnumeration } from "../organizer/standard-dashboard-organizer-package.class";
import { OrganizerPackageEnumerationBase } from "ngx-card-deck";


export interface StandardDashboardCardOutletExtensionViewRender<T> extends CardOutletExtensionViewRender<T> {
    organizerPackage: StandardDashboardOrganizerPackageEnumeration | OrganizerPackageEnumerationBase;
}

export interface StandardDashboardVendorClassificationItem extends VendorClassificationItem {
    organizerPackage: StandardDashboardOrganizerPackageEnumeration | OrganizerPackageEnumerationBase;
}


/* used in card outlet render definitions */
export interface StandardDashboardVendorClassificationMap extends VendorClassificationMap {

    [identifier: string]: StandardDashboardVendorClassificationItem;
}



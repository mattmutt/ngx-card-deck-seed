import { getEnumeratedKeyString } from "ngx-card-deck";

export enum StandardDashboardOrganizerPackageEnumeration {
   // CLONE from engine `OrganizerPackageEnumerationBase`
   // internal,

   // enhanced projects to showcase the power of the dashboard engine

}


// string-based enumeration key resolution
export function getOrganizerPackageKey(enumeration: StandardDashboardOrganizerPackageEnumeration): string {
   return (getEnumeratedKeyString
      <typeof StandardDashboardOrganizerPackageEnumeration>(StandardDashboardOrganizerPackageEnumeration, enumeration));
}


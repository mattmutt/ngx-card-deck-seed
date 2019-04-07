import { getEnumeratedKeyString } from "ngx-card-deck";

export enum StandardDashboardOrganizerPackageEnumeration {
   // CLONE from engine `OrganizerPackageEnumerationBase`
   // internal,

   // enhanced projects to showcase the power of the dashboard engine

   // represents the APIs and services to render a node flow based rendering toolkit
   nodeflow = 1000
}


// string-based enumeration key resolution
export function getOrganizerPackageKey(enumeration: StandardDashboardOrganizerPackageEnumeration): string {
   return (getEnumeratedKeyString
      <typeof StandardDashboardOrganizerPackageEnumeration>(StandardDashboardOrganizerPackageEnumeration, enumeration));
}


import { getEnumeratedKeyString } from "ngx-card-deck";

export enum DemoDashboardOrganizerPackageEnumeration {
    // hardcode: must statically CLONE from engine `OrganizerPackageEnumerationBase`
    internal = 1,

    // customized
    com_company_acme_shared_library, // team shared framework, shared stuff
    com_company_sample1, // Example group 1:  client is one of the "vendor" consumer of the specification
    com_company_sample2 // Example group 2: extension samples, how to roll a new grouping

}


// string-based enumeration key resolution
export function getOrganizerPackageKey(enumeration: DemoDashboardOrganizerPackageEnumeration): string {
    return getEnumeratedKeyString<typeof DemoDashboardOrganizerPackageEnumeration>(DemoDashboardOrganizerPackageEnumeration, enumeration);
}


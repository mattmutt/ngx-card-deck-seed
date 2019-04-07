// abstract business concepts in the context of a card
// idea is to extend to support any client use case for storing additional data

export type BusinessNodeflowGlobalIdentifier = string;

export interface BusinessNodeflowCardProviderSchema {
    assetTypeId: string; // numeric like
    catalogId: BusinessNodeflowGlobalIdentifier; // GUID
    layoutId: BusinessNodeflowGlobalIdentifier; // GUID
}


import {
    BaseModelItemSchema, BaseModelSchema,
    ManagedObjectReferenceType
} from "../../../lib/services/sample-product/platform/demo-app-terminology.interface";
import {
    FieldBaseMetadata,
    FieldRenderTemplateBaseMetadata
} from "ngx-card-deck";

// server message format

export interface SummaryBillboardFieldLocalized {
    key: string;
}

export interface SummaryBillboardFieldDimension {
    value: number;
    metric: "%" | "px" | "rem" | "vw" | "vh";
}

export interface SummaryBillboardFieldResponsiveDimension {
    // minimum: SummaryBillboardFieldDimension;
    initial: SummaryBillboardFieldDimension;
    // maximum: SummaryBillboardFieldDimension;
}


// adds some additional fields
export interface SummaryBillboardFieldRenderTemplate extends FieldRenderTemplateBaseMetadata {
    organization: string; // team responsible for template construction

}

export type SummaryBillboardFieldLayoutAlignmentType = "left" | "right" | "top" | "bottom" | "middle";

export interface SummaryBillboardFieldDataType {
    classifier: "string" | "number" | "boolean" | "date" | "datetime";
    // opt in
    specifier?: string; // floating point, currency, duration, timezone agnostic date plan
    collection?: boolean; // is the value a set of the same type or single value
}

// field level resource structure

export interface SummaryBillboardFieldMetadata extends FieldBaseMetadata {
    type: SummaryBillboardFieldDataType;

    text: {
        header: SummaryBillboardFieldLocalized;
    };

    layout: {
        alignment: SummaryBillboardFieldLayoutAlignmentType;
        dimensions: {
            width?: SummaryBillboardFieldResponsiveDimension;
        };
    };

    view: {
        // header: SummaryBillboardFieldRenderTemplate;
        body: SummaryBillboardFieldRenderTemplate;
    };
}

/*
 {
    "provider": {"serverGuid": "b9f47ff7-5a1f-460f-b97a-9c2c65397e0c", "type": "Folder", "value": "group-d1"},
    "dashboardData": [
    {"label": "vmCount", "value": "8", "nestedProperties": null}, {
        "label": "vmPoweredOnCount",
        "value": "3",
        "nestedProperties": null
    }, {"label": "vmPoweredOffCount", "value": "5", "nestedProperties": null}, {
        "label": "vmSuspendedCount",
        "value": "0",
        "nestedProperties": null
    }
    ]
};
*/


// dashboard-model specific
export interface SummaryBillboardDataModelItemSchema extends BaseModelItemSchema {
    label: string;
    value: string;
    nestedProperties?: any;
}

// delivered via backend REST endpoint JSON - for "dashboard" models
export interface SummaryBillboardDataModelSchema extends BaseModelSchema {
    provider: ManagedObjectReferenceType;
    dashboardData: Array<SummaryBillboardDataModelItemSchema>;
}

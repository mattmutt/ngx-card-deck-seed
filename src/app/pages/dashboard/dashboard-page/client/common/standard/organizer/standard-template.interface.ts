import {
    FieldBaseMetadata,
    FieldRenderTemplateBaseMetadata
} from "ngx-card-deck";

export interface StandardFieldLocalized {
    key: string;
}

export interface StandardFieldDimension {
    value: number;
    metric: "%" | "px" | "rem" | "vw" | "vh";
}

export interface StandardFieldResponsiveDimension {
    minimum: StandardFieldDimension;
    initial: StandardFieldDimension;
    maximum: StandardFieldDimension;
}


// adds some additional fields
export interface StandardFieldRenderTemplate extends FieldRenderTemplateBaseMetadata {
    organization: string; // project/group responsible for template construction

}

export type StandardFieldLayoutAlignmentType = "left" | "right" | "top" | "bottom" | "middle";

export interface StandardFieldDataType {
    classifier: "string" | "number" | "boolean" | "date" | "datetime";
    specifier?: string; // floating point, currency, duration, timezone agnostic date plan
    collection?: boolean; // is the value a set of the same type or single value
}

// field level resource structure

export interface StandardFieldMetadata extends FieldBaseMetadata {
    type: StandardFieldDataType;

    text: {
        header: StandardFieldLocalized;
    };

    layout: {
        alignment: StandardFieldLayoutAlignmentType;
        dimensions: {
            width?: StandardFieldResponsiveDimension;
        };
    };

    view: {
        header: StandardFieldRenderTemplate;
        body: StandardFieldRenderTemplate;
    };
}


// server message format

import {
    FieldBaseMetadata,
    FieldRenderTemplateBaseMetadata
} from "ngx-card-deck";

export interface RelationalDataFieldLocalized {
   key: string;
}


export interface RelationalDataFieldDimension {
   clipping: boolean; // when set, restrained content to fit within cell width, overflow preventer
   value: number;
   metric: "%" | "px" | "rem" | "vw" | "vh";
}

export interface RelationalDataFieldResponsiveDimension {
   minimum: RelationalDataFieldDimension;
   initial: RelationalDataFieldDimension;
   maximum: RelationalDataFieldDimension;
}


// adds some additional fields
export interface RelationalDataFieldRenderTemplate extends FieldRenderTemplateBaseMetadata {
   organization: string; // team responsible for template construction

}

export type RelationalDataFieldLayoutAlignmentType = "left" | "right" | "top" | "bottom" | "middle";

export interface RelationalDataFieldDataType {
   classifier: "string" | "number" | "boolean" | "date" | "datetime";
   // opt in
   specifier?: string; // floating point, currency, duration, timezone agnostic date plan
   collection?: boolean; // is the value a set of the same type or single value
}

// field level resource structure

export interface RelationalDataFieldMetadata extends FieldBaseMetadata {
   type: RelationalDataFieldDataType;

   text: {
      header: RelationalDataFieldLocalized;
   };

   layout: {
      alignment: RelationalDataFieldLayoutAlignmentType;
      dimensions: {
         width?: RelationalDataFieldResponsiveDimension;
      };
   };

   view: {
      header: RelationalDataFieldRenderTemplate;
      body: RelationalDataFieldRenderTemplate;
   };
}


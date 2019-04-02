// server message format

import {
    FieldBaseMetadata,
    FieldRenderTemplateBaseMetadata
} from "ngx-card-deck";

export interface MetricsBillboardFieldLocalized {
   key: string;
}

export interface MetricsBillboardFieldDimension {
   value: number;
   metric: "%" | "px" | "rem" | "vw" | "vh";
}

export interface MetricsBillboardFieldResponsiveDimension {
   minimum: MetricsBillboardFieldDimension;
   initial: MetricsBillboardFieldDimension;
   maximum: MetricsBillboardFieldDimension;
}


// adds some additional fields
export interface MetricsBillboardFieldRenderTemplate extends FieldRenderTemplateBaseMetadata {
   organization: string; // team responsible for template construction

}

export type MetricsBillboardFieldLayoutAlignmentType = "left" | "right" | "top" | "bottom" | "middle";

export interface MetricsBillboardFieldDataType {
   classifier: "string" | "number" | "boolean" | "date" | "datetime";
   // opt in
   specifier?: string; // floating point, currency, duration, timezone agnostic date plan
   collection?: boolean; // is the value a set of the same type or single value
}

// field level resource structure

export interface MetricsBillboardFieldMetadata extends FieldBaseMetadata {
   type: MetricsBillboardFieldDataType;

   text: {
      header: MetricsBillboardFieldLocalized;
   };

   layout: {
      alignment: MetricsBillboardFieldLayoutAlignmentType;
      dimensions: {
         width?: MetricsBillboardFieldResponsiveDimension;
      };
   };

   view: {
      header: MetricsBillboardFieldRenderTemplate;
      body: MetricsBillboardFieldRenderTemplate;
   };
}


// per item in the collection schema
export interface MetricsBillboardDataRecordEntitySchema {
   provider: {
      serverGuid: string;
      type: string;
      value: string;
   };
   summaryItems: Array<{
      label: string;
      value: number
   }>;
   resourceMeters: Array<{
      title: string;
      free: string;
      used: string;
      capacity: string;
      progress: number;
   }>;
}


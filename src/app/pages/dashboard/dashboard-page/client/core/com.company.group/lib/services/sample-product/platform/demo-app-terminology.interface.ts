export interface ManagedObjectReferenceType {
   value: string;
   type: string;
   serverGuid: string; // unique hashing
}


// data elements per monitored aspect
export interface ResourceMetersModelItemSchema {
   title: string;
   capacity: string;
   free: string;
   progress: number;
   used: string;
}


// essential data response schema marker
// tslint:disable-next-line:no-empty-interface
export interface BaseModelSchema {
}

// base marker
// tslint:disable-next-line:no-empty-interface
export interface BaseModelItemSchema {

}

// marker for containing view-specific items
// tslint:disable-next-line:no-empty-interface
export interface BaseViewItemSchema {
} // dump anything


// client to transform ModelItemSchema into a view-capable representation
export interface NumericTransformValueItem {
   model: BaseModelItemSchema; // server supplied
   view: BaseViewItemSchema; // view transformed variables
   message: string; // localized
   data: number; // transformed
}



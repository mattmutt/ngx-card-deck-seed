export enum ToolbarSerializedDocumentEntityPackagingType {
    nativeDashboardResourceJson = 1,
    nodeflowConfigurationSchemaJson = 2
}

export class ToolbarSerializedDocumentContent {
    documentType: string;

    //var typedArray = new Uint8Array([1, 2, 3, 4]),
    //normalArray = Array.prototype.slice.call(typedArray);
    content: string; // internal doc payload
}

export class ToolbarSerializedDocumentEntityReference {
    documentId: string; // global ID to reference the document from a CMS
    filename: string;
    packagingFormatType: ToolbarSerializedDocumentEntityPackagingType;
    createdDate: Date;

    // loaded contents
    document?: ToolbarSerializedDocumentContent;
}




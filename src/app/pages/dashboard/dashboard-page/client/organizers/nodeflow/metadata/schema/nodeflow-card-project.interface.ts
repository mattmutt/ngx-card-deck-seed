import {
    CardProjectPackage,
    CardProjectPackageSchematicIdentifiable,
    CardProjectPackageSchematicTemplatable
} from "./card-project.interface";

interface NodeflowProjectCardMessageStateSchema {
    classifier: string;
    data: any; // user defined
}

export interface NodeflowProjectCardMessageModelSchema {
    topic: string;
    form: { component: string };
    state: NodeflowProjectCardMessageStateSchema;
}


export interface NodeflowCardProjectPackageSchema extends CardProjectPackage {

    schematic: {

        card: {
            components: Array<CardProjectPackageSchematicIdentifiable>;
            assetTypes: Array<CardProjectPackageSchematicIdentifiable>;
            messages: Array<NodeflowProjectCardMessageModelSchema>;
            templates: Array<CardProjectPackageSchematicTemplatable>;

        };
    };

}



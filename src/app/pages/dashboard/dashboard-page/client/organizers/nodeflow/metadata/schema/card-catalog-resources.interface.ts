import { CardProjectPackageSchematicIdentifiable } from "./card-project.interface";


export interface CardCatalogResourceItemPackage extends CardProjectPackageSchematicIdentifiable {
    sourceFile: string;
    encodingType: string;

}

// contents of `catalog.json`
export interface CardCatalogResourcesPackage extends CardProjectPackageSchematicIdentifiable {
    resources: Array<CardCatalogResourceItemPackage>;
    references: {
        projectItemId: string; // link to project/item/id
    };
}


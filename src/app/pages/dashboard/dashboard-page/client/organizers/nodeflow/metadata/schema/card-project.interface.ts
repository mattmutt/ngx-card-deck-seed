export interface CardProjectPackageSchematicInteractable {
    // selected within a list?
    selected: boolean;
}

export interface CardProjectPackageSchematicIdentifiable {
    id: string;
    label: string;
    interaction: CardProjectPackageSchematicInteractable;
}

export interface CardProjectPackageSchematicTemplatable extends CardProjectPackageSchematicIdentifiable {
    data: {
        [identifier: string]: {
            organization: string;
            template: string;
        }
    };
}

// the decorative schema for the overview of a project. UI to ingest and use for promoting constraints
// contents of `project.json`
export interface CardProjectPackage {
    project: {
        item: CardProjectPackageSchematicIdentifiable;
        organization: CardProjectPackageSchematicIdentifiable;
    };
}

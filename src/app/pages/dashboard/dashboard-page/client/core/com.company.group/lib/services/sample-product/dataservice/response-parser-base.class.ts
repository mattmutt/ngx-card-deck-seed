import { RelationalDataFieldMetadata } from "../../../../views/card-assembly-plugins/simple-grid-card/grid-relational-data-field-model.interface";
import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { TemplateLibraryManager } from "ngx-card-deck";

export interface ResponseParserRegisterable {

    register(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
             libraryStateManager: TemplateLibraryManager,
             fieldMetadataList: Array<RelationalDataFieldMetadata>): ParsedResponseTransformable | undefined;

}

export interface ParsedResponseTransformable {

    prepare(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
            fieldMetadataList: Array<RelationalDataFieldMetadata>,
            libraryStateManager: TemplateLibraryManager): void;

    getStrategyIdentifier(): string;
    // ETL refinement
    extract(responseMessage: object): Array<any>;
    transform(data: Array<any>): Array<any>;


}

export abstract class ParsedResponseTransformBase implements ParsedResponseTransformable {
    protected card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>;
    protected fieldMetadataList: Array<RelationalDataFieldMetadata>;
    protected libraryStateManager: TemplateLibraryManager;


    public prepare(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                   fieldMetadataList: Array<RelationalDataFieldMetadata>,
                   libraryStateManager: TemplateLibraryManager) {
        this.card = card;
        this.fieldMetadataList = fieldMetadataList;
        this.libraryStateManager = libraryStateManager;
    }


    // internal to interface
    public abstract extract(responseMessage: object): Array<any>;

    public abstract transform(data: Array<any>): Array<any>;

    public abstract getStrategyIdentifier(): string;

}


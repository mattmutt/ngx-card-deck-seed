import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { TemplateLibraryManager } from "ngx-card-deck";
import { StandardResponseParserTransformable } from "../../../../../../common/standard/card-outlet/card-assembly-plugins/base/standard-response-parser-base";
import { FieldBaseMetadata } from "ngx-card-deck";


// supplied RelationalDataFieldMetadata
export abstract class ParsedResponseTransformBase<M extends FieldBaseMetadata> implements StandardResponseParserTransformable<M> {
    protected card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>;
    protected fieldMetadataList: Array<M>;
    protected libraryStateManager: TemplateLibraryManager;


    public prepare(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                   fieldMetadataList: Array<M>,
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


import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { TemplateLibraryManager } from "ngx-card-deck";
import { FieldBaseMetadata } from "ngx-card-deck";


//  Plugin's parser service will adopt this behavior
export interface ResponseParserRegisterable<M extends FieldBaseMetadata> {

    register(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
             libraryStateManager: TemplateLibraryManager,
             fieldMetadataList: Array<M>): StandardResponseParserTransformable<M> | undefined;

}


export interface StandardResponseParserTransformable<M extends FieldBaseMetadata> {

    prepare(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
            fieldMetadataList: Array<M>,
            libraryStateManager: TemplateLibraryManager): void;

    getStrategyIdentifier(): string;

    extract(responseMessage: object): Array<any> | object;

    transform(data: Array<any> | object): Array<any>;
}

export abstract class StandardParsedResponseTransformBase<M extends FieldBaseMetadata> implements StandardResponseParserTransformable<M> {
    protected card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>;
    protected fieldMetadataList: Array<M>;
    protected libraryStateManager: TemplateLibraryManager;


    /* tslint:disable:max-line-length */
    public prepare(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                   fieldMetadataList: Array<M>,
                   libraryStateManager: TemplateLibraryManager) {
        this.card = card;
        this.fieldMetadataList = fieldMetadataList;
        this.libraryStateManager = libraryStateManager;
    }


    public abstract extract(responseMessage: object): Array<any> | object;

    public abstract transform(data: Array<any> | object): Array<any>;

    public abstract getStrategyIdentifier(): string;

}


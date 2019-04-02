import { StandardFieldMetadata } from "../../../organizer/standard-template.interface";
import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { TemplateLibraryManager } from "ngx-card-deck";

export interface ParsedResponseTransformable {

   prepare(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
           fieldMetadataList: Array<StandardFieldMetadata>,
           libraryStateManager: TemplateLibraryManager): void;

   getStrategyIdentifier(): string;

   extract(responseMessage: object): Array<any>;

   transform(data: Array<any>): Array<any>;


}

export abstract class StandardParsedResponseTransformBase implements ParsedResponseTransformable {
   protected card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>;
   protected fieldMetadataList: Array<StandardFieldMetadata>;
   protected libraryStateManager: TemplateLibraryManager;


   /* tslint:disable:max-line-length */
   public prepare(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                  fieldMetadataList: Array<StandardFieldMetadata>,
                  libraryStateManager: TemplateLibraryManager) {
      this.card = card;
      this.fieldMetadataList = fieldMetadataList;
      this.libraryStateManager = libraryStateManager;
   }


   public abstract extract(responseMessage: object): Array<any>;

   public abstract transform(data: Array<any>): Array<any>;

   public abstract getStrategyIdentifier(): string;

}


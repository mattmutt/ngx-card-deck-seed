import { Injectable } from "@angular/core";
import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { TemplateLibraryManager } from "ngx-card-deck";
import {
    ResponseParserRegisterable,
    StandardResponseParserTransformable
} from "../../../../../../standard/card-outlet/card-assembly-plugins/base/standard-response-parser-base";
import { StandardFieldMetadata } from "../../../../../../standard/organizer/standard-template.interface";
import { IntroductionListTransformerService } from "./introduction-list-transformer.service";

@Injectable({providedIn: "root"})
export class IntroductionParserService<M extends StandardFieldMetadata> implements ResponseParserRegisterable<M> {

    // as many customized data transformers, add them here as DI
    constructor(private transformer1: IntroductionListTransformerService<M>) {
    }

    // strategy implementation, pull out the correct parser and prepare it for data handling
    public register(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                    libraryStateManager: TemplateLibraryManager,
                    fieldMetadataList: Array<M>): StandardResponseParserTransformable<M> {
        return this.transformer1; // sample: more complex registration processes can be setup to leverage providers declarations
    }

}

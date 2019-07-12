import { Injectable } from "@angular/core";
import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { TemplateLibraryManager } from "ngx-card-deck";
import {
    ResponseParserRegisterable,
    StandardResponseParserTransformable
} from "../../../../standard/card-outlet/card-assembly-plugins/base/standard-response-parser-base";
import { StandardFieldMetadata } from "../../../../standard/organizer/standard-template.interface";
import { MetricsListTransformerService } from "./metrics-list-transformer.service";

const resources = {
    // tags the name of collection within the JSON response that holds resulting dataset
    dashboardServiceAllocatedCollectionName: "ParsedResponseTransformable"
};

/* JSON
"DashboardParserService": {
    "ParsedResponseTransformable": "InventorySummaryTransformerService"
},
 */

@Injectable()
export class MetricsParserService<M extends StandardFieldMetadata> implements ResponseParserRegisterable<M> {


    // as many customized data transformers, add them here as DI
    constructor(private transformer1: MetricsListTransformerService<M>) {
    }


    // strategy implementation, pull out the correct parser and prepare it for data handling
    public register(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                    libraryStateManager: TemplateLibraryManager,
                    fieldMetadataList: Array<M>): StandardResponseParserTransformable<M> {

        this.transformer1.prepare(card, fieldMetadataList, libraryStateManager);

        /*
        const registeringCollectionName = libraryStateManager.alias.parameters["DashboardParserService"][resources.dashboardServiceAllocatedCollectionName];
        let prt: StandardResponseParserTransformable<M> | undefined;

        // register when found transformer
        if (registeringCollectionName) {
            prt = this.strategyTransformerMap[registeringCollectionName];
            if (prt) {
                prt.prepare(card, fieldMetadataList, libraryStateManager);
            }
        }

         */

        return this.transformer1; // sample: more complex registration processes can be setup to leverage providers declarations
    }


}

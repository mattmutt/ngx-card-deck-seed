import { Injectable } from "@angular/core";
import { DataCollectionParserBase } from "../../../../../../core/com.company.group/lib/services/sample-product/dataservice/data-collection-parser-base";
import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { TemplateLibraryManager } from "ngx-card-deck";
import {
    ResponseParserRegisterable,
    StandardResponseParserTransformable
} from "../../../../../standard/card-outlet/card-assembly-plugins/base/standard-response-parser-base";
import { RelationalDataFieldMetadata } from "../../../../../../core/com.company.group/views/card-assembly-plugins/simple-grid-card/grid-relational-data-field-model.interface";
import { InventorySummaryTransformerService } from "./inventory-summary-transformer.service";

const resources = {
    // tags the name of collection within the JSON response that holds resulting dataset
    dashboardServiceAllocatedCollectionName: "ParsedResponseTransformable"
};


@Injectable()
export class SimpleGridParserService<M extends RelationalDataFieldMetadata> extends DataCollectionParserBase implements ResponseParserRegisterable<M> {


    // as many customized data transformers, add them here as DI
    constructor(private transformer1: InventorySummaryTransformerService
                // private transformer2: InstalledPluginsDashboardTransformerService
    ) {
        super(arguments);

    }

    // strategy implementation, pull out the correct parser and prepare it for data handling
    public register(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                    libraryStateManager: TemplateLibraryManager,
                    fieldMetadataList: Array<M>): StandardResponseParserTransformable<M> | undefined {

        const registeringCollectionName = libraryStateManager.alias.parameters["DashboardParserService"][resources.dashboardServiceAllocatedCollectionName];
        let prt: StandardResponseParserTransformable<M> | undefined;

        // register when found transformer
        if (registeringCollectionName) {
            prt = this.strategyTransformerMap[registeringCollectionName];
            if (prt) {
                prt.prepare(card, fieldMetadataList, libraryStateManager);
            }
        }

        return prt;
    }

}

import { Injectable } from "@angular/core";
import { DataCollectionParserBaseService } from "../../../../../../core/com.company.group/lib/services/sample-product/dataservice/data-collection-parser-base.service";
import {
    ParsedResponseTransformable,
    ResponseParserRegisterable
} from "../../../../../../core/com.company.group/lib/services/sample-product/dataservice/response-parser-base.class";
import { RelationalDataFieldMetadata } from "../../../../../../core/com.company.group/views/card-assembly-plugins/simple-grid-card/grid-relational-data-field-model.interface";
import { InventorySummaryTransformerService } from "./inventory-summary-transformer.service";
import {
    DashboardConfigurationResourceCardSchema,
    DashboardConfigurationResourceFacade
} from "ngx-card-deck";
import { TemplateLibraryManager } from "ngx-card-deck";

const resources = {
    // tags the name of collection within the JSON response that holds prized dataset
    dashboardServiceAllocatedCollectionName: "ParsedResponseTransformable"
};


@Injectable()
export class SimpleGridParserService extends DataCollectionParserBaseService implements ResponseParserRegisterable {


    // as many customized data transformers, add them here as DI
    constructor(private transformer1: InventorySummaryTransformerService
                // private transformer2: InstalledPluginsDashboardTransformerService
    ) {
        super(arguments);

    }

    // strategy implementation, pull out the correct parser and prepare it for data handling
    public register(card: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                    libraryStateManager: TemplateLibraryManager,
                    fieldMetadataList: Array<RelationalDataFieldMetadata>): ParsedResponseTransformable | undefined {

        const registeringCollectionName = libraryStateManager.alias.parameters["DashboardParserService"][resources.dashboardServiceAllocatedCollectionName];
        let prt: ParsedResponseTransformable | undefined;

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

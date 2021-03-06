import { Injectable } from "@angular/core";
import { ParsedResponseTransformBase } from "../../../../../../core/com.company.group/lib/services/sample-product/dataservice/parsed-response-transform-base.class";
import { RelationalDataFieldMetadata } from "../../../../../../core/com.company.group/views/card-assembly-plugins/simple-grid-card/grid-relational-data-field-model.interface";

// ~~~~~~~~~~~~~~~~~~~~ Plugins data segmentation and extraction ~~~~~~~~~~~~~~~~~~~
@Injectable()
export class InstalledPluginsDashboardTransformerService extends ParsedResponseTransformBase<RelationalDataFieldMetadata> {

    constructor() {
        super();
    }

    public getStrategyIdentifier() {
        return "InstalledPluginsDashboardTransformerService";
    }

    // step 1 extract collection
    public extract(serverResponse: any): Array<any> {
        return serverResponse.response.entity;
    }

    // step 2 transform collection to view DAO
    // view helper: create subset of only visible columns, localize the displayed label
    public transform(dataItems: Array<any>): Array<any> {

        return dataItems.map((item) => {

            const entity: any = {
                "id": item.id,
                "plugin_name": item.name,
                "installed_status": item.state === "enabled"
            };
            return entity;
        });

    }


}

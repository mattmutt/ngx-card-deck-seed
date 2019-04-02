import { Injectable } from "@angular/core";
import { SummaryBillboardDataModelItemSchema } from "../../../../../core/com.company.group/views/card-assembly-plugins/summary-billboard/summary-billboard.interface";
import { NumericTransformValueItem } from "../../../../../core/com.company.group/lib/services/sample-product/platform/demo-app-terminology.interface";
import { TemplateLibraryManager } from "ngx-card-deck";


@Injectable()
export class SummaryParserService {

    constructor(private _library: TemplateLibraryManager) {

    }


    // view helper: create subset of only visible columns, localize the displayed label
    public deriveVisibleModelItemsList(dataItems: Array<SummaryBillboardDataModelItemSchema>): Array<NumericTransformValueItem> {

        const i18n = this._library.alias.cardI18n;
        // post transformed decorated structure
        const results: Array<NumericTransformValueItem> = [];

        dataItems.forEach((dataItem) => {

            const isProcessableFlag = true;
            if (isProcessableFlag) {

                const valueItem: NumericTransformValueItem = {
                    model: dataItem,
                    view: {}, // no special parameter
                    message: i18n[dataItem.label],
                    data: parseInt(dataItem.value, 10)
                };

                results.push(valueItem);
            }
        });

        return results;
    }


}

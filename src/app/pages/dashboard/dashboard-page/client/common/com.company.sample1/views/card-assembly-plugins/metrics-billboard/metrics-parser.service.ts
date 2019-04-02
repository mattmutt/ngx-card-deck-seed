import { Injectable } from "@angular/core";
import { TemplateLibraryManager } from "ngx-card-deck";
import {
    BaseViewItemSchema,
    NumericTransformValueItem,
    ResourceMetersModelItemSchema
} from "../../../../../core/com.company.group/lib/services/sample-product/platform/demo-app-terminology.interface";


@Injectable()
export class MetricsParserService {

    constructor(private _library: TemplateLibraryManager) {

    }

    // view helper: create subset of only visible columns, localize the displayed label
    public deriveVisibleModelItemsList(dataItems: Array<ResourceMetersModelItemSchema>): Array<NumericTransformValueItem> {

        const i18n = this._library.alias.cardI18n;
        // post transformed decorated structure
        const results: Array<NumericTransformValueItem> = [];

        dataItems.forEach((dataItem) => {

            const isProcessableFlag = true; // should be read in param
            if (isProcessableFlag) {

                const valueItem: NumericTransformValueItem = {
                    model: dataItem,
                    view: this.baseViewItemFactory(dataItem), // be practical for placing transient variables bound to the view
                    message: i18n[dataItem.title],
                    data: dataItem.progress // core value
                };

                results.push(valueItem);
            }
        });


        return results;
    }


    // add view helpers per data item
    private baseViewItemFactory(dataBoundItem: ResourceMetersModelItemSchema): BaseViewItemSchema {
        const trailingDecimalSize = 0;
        const a: any = {};
        a.attribute = {
            free: {
                value: parseFloat(dataBoundItem.free).toFixed(trailingDecimalSize),
                unit: dataBoundItem.free.split(/ +/)[1] // problem with data aspect
            }
        };

        return a;
    }


}

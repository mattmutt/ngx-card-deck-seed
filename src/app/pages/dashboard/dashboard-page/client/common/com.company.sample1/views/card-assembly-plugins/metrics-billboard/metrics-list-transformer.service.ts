import { Injectable } from "@angular/core";
import {
    BaseViewItemSchema,
    NumericTransformValueItem,
    ResourceMetersModelItemSchema
} from "../../../../../core/com.company.group/lib/services/sample-product/platform/demo-app-terminology.interface";
import { StandardParsedResponseTransformBase } from "../../../../standard/card-outlet/card-assembly-plugins/base/standard-response-parser-base";
import { StandardFieldMetadata } from "../../../../standard/organizer/standard-template.interface";


// strategies based upon some token
@Injectable()
export class MetricsListTransformerService<M extends StandardFieldMetadata> extends StandardParsedResponseTransformBase<M> {
    constructor() {
        super();
    }

    public getStrategyIdentifier() {
        return "MetricsListTransformerService";
    }

    // step 1 extract collection
    public extract(serverResponse: any): Array<any> {
        // message embeds collection within
        return serverResponse.resourceMeters.slice(0); // clone array
    }


    /*
    // sample: augment with an `iconClass` property to yield a complete `IntroductionTransformedCategoryModel` instance
    const generateIntroductionTransformedCategoryModel = (categoryFoundation: IntroductionCategorySchema): IntroductionTransformedCategoryModel =>
        (Object.assign({
            iconClass: ["icon", categoryFoundation.id].join("-") // decorate a CSS class for icon
        }, categoryFoundation));

    // cached list of category objects
    const categoryMap = new Map(dataItems.categories.map((cat) => [cat.id, generateIntroductionTransformedCategoryModel(cat)] as unknown) as ReadonlyArray<[string, IntroductionTransformedCategoryModel]>);

    return dataItems.devices.map((item: IntroductionDeviceSchema) => ({
        itemIdentifier: item.id,
        label: item.name,
        category: categoryMap.get(item.categoryId)! // presumed to match for purposes of the sample. real robust code would reject it
    }));

     */


    // step 2 transform collection
    // view helper: changes the data source into some view model compatible structure
    public transform(dataItems: Array<ResourceMetersModelItemSchema>): Array<NumericTransformValueItem> {

        const results: Array<NumericTransformValueItem> = [];

        dataItems.forEach((dataItem) => {
            const isProcessableFlag = true; // should be read in param
            if (isProcessableFlag) {

                const valueItem: NumericTransformValueItem = {
                    model: dataItem,
                    view: this.baseViewItemFactory(dataItem), // be practical for placing transient variables bound to the view
                    // message: this.libraryStateManager.alias.cardI18n[dataItem.title],
                    message: dataItem.title,
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

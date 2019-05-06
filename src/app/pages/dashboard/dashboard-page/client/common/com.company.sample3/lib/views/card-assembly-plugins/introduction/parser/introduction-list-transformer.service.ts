import { Injectable } from "@angular/core";
import { StandardParsedResponseTransformBase } from "../../../../../../standard/card-outlet/card-assembly-plugins/base/standard-response-parser-base";
import { StandardFieldMetadata } from "../../../../../../standard/organizer/standard-template.interface";
import {
    IntroductionCategorySchema,
    IntroductionDeviceSchema,
    IntroductionTransformedCategoryModel,
    IntroductionTransformedDeviceModel
} from "../introduction.interface";


// strategies based upon some token
@Injectable({providedIn: "root"})
export class IntroductionListTransformerService<M extends StandardFieldMetadata> extends StandardParsedResponseTransformBase<M> {

    constructor() {
        super();
    }

    public getStrategyIdentifier() {
        return "IntroductionListTransformerService";
    }


    // step 1 extract collection
    public extract(serverResponse: any): Array<any> {
        // message embeds collection within
        return serverResponse.collections;
    }


    // step 2 transform collection
    // view helper: changes the data source into some view model compatible structure
    public transform(dataItems: { devices: Array<IntroductionDeviceSchema>; categories: Array<IntroductionCategorySchema>; }): Array<IntroductionTransformedDeviceModel> {

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

    }


}

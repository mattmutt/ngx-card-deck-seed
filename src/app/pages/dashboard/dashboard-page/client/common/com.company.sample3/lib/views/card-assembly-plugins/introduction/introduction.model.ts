import { providerResourceMappedKeyPrefix } from "ngx-card-deck";
import { TemplateLibraryManager } from "ngx-card-deck";
import { DashboardCardModelSchema } from "ngx-card-deck";
import {
    IntroductionAssetTypeConfigurationSchema,
    IntroductionCardProviderSchema,
    IntroductionDataRecordEntitySchema,
    IntroductionTransformedDeviceModel, SimpleIntroductionMessageHistory
} from "./introduction.interface";

// able to transform and mutate, based upon business rule strategies
const resources = {
    providers: {
        introductionKey: "introduction"
    }
};

export class IntroductionDataModel implements DashboardCardModelSchema {
    // envelope holding records
    response: {
        entity: IntroductionDataRecordEntitySchema
    };
}


// holds together state, providers, post-transformed models
export class IntroductionCardAssemblyPluginModel {

    // mapped providers
    providers: { introduction: IntroductionCardProviderSchema } = {} as any;

    // materialized or stateful values used by the plugin
    model: {
        viewAssetIconClass: string; // view: icon class to render
        assetType: IntroductionAssetTypeConfigurationSchema; // transformed result from serialized card provider metadata
        devices: Array<IntroductionTransformedDeviceModel>; // transformed result from serialized web service call
        messageHistoryList: Array<SimpleIntroductionMessageHistory>, // list of captured chat messages

        title: string; // service message provider
        product: string; // service message provider

    } = {} as any;


    constructor(library: TemplateLibraryManager) {
        this.model.messageHistoryList = [];
        // ingest the providers
        this.providers.introduction = library.alias.parameters[providerResourceMappedKeyPrefix + resources.providers.introductionKey];
    }

}


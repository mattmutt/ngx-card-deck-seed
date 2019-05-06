import { SimpleInlineConfigurationCardProviderBaseSchema } from "ngx-card-deck";


// example: device -- inside master record `IntroductionDataRecordEntitySchema`
export interface IntroductionDeviceSchema {
    id: string;
    name: string;
    categoryId: string; // refId
}


// example: category -- inside master record `IntroductionDataRecordEntitySchema`
export interface IntroductionCategorySchema {
    id: string;
    name: string;
}

// the introduction sample holds a list of devices and categories
export interface IntroductionDataRecordEntitySchema {
    product: string;
    organization: string;
    name: string;
    collections: {
        devices: Array<IntroductionDeviceSchema>;
        categories: Array<IntroductionCategorySchema>;
    };
}

// after service performs ETL

// Transformed Category part of device
// tslint:disable-next-line:no-empty-interface
export interface IntroductionTransformedCategoryModel extends IntroductionCategorySchema {
    iconClass: string;
}

// Transformed Device part of IntroductionCardAssemblyPluginModelModel
export interface IntroductionTransformedDeviceModel {
    itemIdentifier: string;
    label: string;
    category: IntroductionTransformedCategoryModel; // object association
}


// structure of entity in `asset-type-list` json
export interface IntroductionAssetTypeConfigurationSchema {
    assetTypeId: string;
    iconDecoratorClass: string;

    localization: {
        name: {
            text: string;
        };
    };
}

// introduction provider extension point over base schema
export interface IntroductionCardProviderSchema extends SimpleInlineConfigurationCardProviderBaseSchema {
    assetTypeId: string; // relates to an icon to show
    channelTopic: string; // showcase how messaging bus can broadcast effectively
}


// chat message
export interface SimpleIntroductionMessageHistory {
    senderName: string;
    senderIcon: string;
    message: string;
    receivedDate: Date; // produced later upon receiving
}


import { NodeflowAssetNodeDataRecordEntitySchema } from "./nodeflow-asset-node.interface";
import { DashboardCardModelSchema } from "ngx-card-deck";
import { AssetNodeConfigurationCardSchema } from "../../../lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.interface";
import { BusinessNodeflowCardProviderSchema } from "../../../lib/models/parsers/dashboard/provider/business-nodeflow-card-provider.interface";


// structure of entity in `asset-type-list` json
export interface AssetTypeConfigurationSchema {
    assetTypeId: string;
    iconDecoratorClass: string;
    localization: {
        name: {
            text: string;
        };
    };
}

// component links via `cardMetadata`
export interface AssetNodeCardMetadataSchema {
    schema: AssetNodeConfigurationCardSchema;
    // business interface for provider linked on card
    businessProvider: BusinessNodeflowCardProviderSchema;

    assetType: AssetTypeConfigurationSchema;
    derived: {
        assetTypeIconClass: string;
    };
}


// potential segment drag/reassign states
export enum NodeflowAssetNodeComponentInteractionSelectingState {
    none = 0,
    focused // setting while selecting from a dropdown menu to highlight which socket might take some action upon
}

export interface NodeflowAssetNodeComponentInteractionRules {
    selecting: NodeflowAssetNodeComponentInteractionSelectingState;
}


// able to transform and mutate, based upon business rule strategies
export class NodeflowAssetNodeDataModel implements DashboardCardModelSchema {
    // envelope holding records
    response: {
        entity: NodeflowAssetNodeDataRecordEntitySchema;
    };
}



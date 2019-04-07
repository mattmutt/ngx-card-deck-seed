import { Pipe, PipeTransform } from "@angular/core";
import { AssetTypeConfigurationSchema } from "../../../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.model";

// organizes list
@Pipe({
    name: "assetTypeOrderBy"
})
export class AssetTypeOrderByPipe implements PipeTransform {
    transform(items: Array<AssetTypeConfigurationSchema>): Array<AssetTypeConfigurationSchema> {

        return items.sort((a: AssetTypeConfigurationSchema, b: AssetTypeConfigurationSchema) =>
            a.localization.name.text < b.localization.name.text
                ? -1
                : a.localization.name.text === b.localization.name.text ? 0 : 1);
    }
}

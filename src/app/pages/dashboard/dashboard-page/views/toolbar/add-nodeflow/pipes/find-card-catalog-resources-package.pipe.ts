import { Pipe, PipeTransform } from "@angular/core";
import { CardCatalogResourcesPackage } from "../../../../client/organizers/nodeflow/metadata/schema/card-catalog-resources.interface";


// filters the catalogs that would server the current dashboard configuration. should be exactly one match
@Pipe({
    name: "findCardCatalogResourcesPackage"
})
export class FindCardCatalogResourcesPackagePipe implements PipeTransform {
    transform(
        items: Array<CardCatalogResourcesPackage>,
        id: string
    ): CardCatalogResourcesPackage | undefined {

        return (id
            ? items.filter((cardCatalogConfig) => cardCatalogConfig.resources
                .filter((cardCatalogResourceItem) => cardCatalogResourceItem.id === id))[0]
            : undefined);
    }
}

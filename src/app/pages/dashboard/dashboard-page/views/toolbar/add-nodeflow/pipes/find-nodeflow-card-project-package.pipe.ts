import { Pipe, PipeTransform } from "@angular/core";
import { NodeflowCardProjectPackageSchema } from "../../../../client/organizers/nodeflow/metadata/schema/nodeflow-card-project.interface";


// filters the catalogs that would server the current dashboard configuration. should be exactly one match
@Pipe({
    name: "findNodeflowCardProjectPackage"
})
export class FindNodeflowCardProjectPackagePipe implements PipeTransform {
    transform(
        items: Array<NodeflowCardProjectPackageSchema>,
        id: string
    ): NodeflowCardProjectPackageSchema | undefined {

        return (id
            ? items.filter((projectPackage) => projectPackage.project.item.id === id)[0]
            : undefined);
    }
}

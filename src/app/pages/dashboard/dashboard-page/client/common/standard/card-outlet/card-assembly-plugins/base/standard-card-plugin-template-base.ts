import { CardPluginTemplateBase } from "ngx-card-deck";
import { StandardFieldRenderTemplate } from "../../../organizer/standard-template.interface";


export abstract class StandardCardPluginTemplateBase extends CardPluginTemplateBase {
    // +++++++++++++++++++ implementations over base class +++++++++++++++++++++++
    // via metadata : only this organization can consume and deal with the templates matching owner of card's organization.
    // placed here for sample validation. The rules must be asserted and implemented by the team
    public validateRenderTemplateMetadata(metadata: StandardFieldRenderTemplate): boolean {
        // example rule: template organization must share common stem from the organization as class defined one
        return metadata && metadata.organization.indexOf(this.templateOrganization.classification.organization) === 0;
    }

}

import { AfterViewInit, Component, ElementRef, forwardRef, Inject, OnInit } from "@angular/core";
import { CardPluginTemplateBase } from "ngx-card-deck";
import {
    DashboardCardTemplatableClassMetadata,
    TemplateCreatorOrganization,
    TemplateViewClassification
} from "ngx-card-deck";
import { demoDashboardVendorClassificationMap } from "../../../../../../../integration/card-outlet/demo-dashboard-vendor-classification.class";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import { SimpleGridCardComponent } from "../../../../../../core/com.company.group/views/card-assembly-plugins/simple-grid-card/simple-grid-card.component";
import { CardResourceInjectionTokenValue } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";
import {
    RelationalDataFieldMetadata,
    RelationalDataFieldRenderTemplate
} from "../../../../../../core/com.company.group/views/card-assembly-plugins/simple-grid-card/grid-relational-data-field-model.interface";


@Component({
    selector: 'dash-demo-client-grid-card-template',
    templateUrl: './demo-client-grid-card-template.html'
})
export class DemoClientGridCardTemplateComponent extends CardPluginTemplateBase implements OnInit, AfterViewInit {

    // annotation stamped at class level
    public static classification: DashboardCardTemplatableClassMetadata = {
        organization: new TemplateCreatorOrganization(demoDashboardVendorClassificationMap['1'], "grid card template")
    };

    constructor(// interface token conformance requirement
        @Inject(forwardRef(() => CARD_RESOURCE_TOKEN)) public resourceToken: CardResourceInjectionTokenValue,
        @Inject(forwardRef(() => SimpleGridCardComponent)) public cardAssemblyPlugin: SimpleGridCardComponent, // implements DashboardCardPluggable

        _dashboardComponent: DashboardComponent,
        _globalState: GlobalStateBase,
        _element: ElementRef) {

        // todo: angular claims the constructor is inherited, why a manual injection? remove this needless constructor
        super(resourceToken, cardAssemblyPlugin, _dashboardComponent, _globalState, _element);

        // certification of template : who organized it
        // should only be ONE SINGLETON of the organization.
        // todo: supply collaborators to constructor as injectables - below is an antipattern
        this.templateOrganization = DemoClientGridCardTemplateComponent.classification.organization; // class level ref
        this.viewClassification = new TemplateViewClassification("grid", "data grid template container");
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        // for safety timing wait until custom component has its chance
        setTimeout(() => {
            this.cardAssemblyPlugin["initializeGridView"]();
        }, 0);
    }


    // +++++++++++++++++++ implementations over base class +++++++++++++++++++++++
    // via metadata : only this organization can consume and deal with the template. avoids cross pollination side effects
    public validateRenderTemplateMetadata(metadata: RelationalDataFieldRenderTemplate): boolean {
        return metadata && metadata.organization === this.templateOrganization.classification.organization;
    }

    // navigate interaction
    public navigateToManagedObject(record: any, field: RelationalDataFieldMetadata) {
        /* for tabs
        const fvbc = field.view.body.context;
        if (fvbc && fvbc.interactions && fvbc.interactions.click) {
            const targetTabIdentifier = fvbc.interactions.click.targetedTab;
            // dispatch to a sibling tab perhaps
        }
        */

    }

}

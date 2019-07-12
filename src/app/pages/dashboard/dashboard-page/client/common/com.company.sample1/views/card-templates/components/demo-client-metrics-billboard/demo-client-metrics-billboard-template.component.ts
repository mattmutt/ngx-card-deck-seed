import { Component, ElementRef, forwardRef, Inject, OnInit } from "@angular/core";
import { MetricsBillboardComponent } from "../../../../../../core/com.company.group/views/card-assembly-plugins/metrics-billboard/metrics-billboard.component";
import { RelationalDataFieldRenderTemplate } from "../../../../../../core/com.company.group/views/card-assembly-plugins/simple-grid-card/grid-relational-data-field-model.interface";
import { demoDashboardVendorClassificationMap } from "../../../../../../../integration/card-outlet/demo-dashboard-vendor-classification.class";
import { CardPluginTemplateBase } from "ngx-card-deck";
import {
    DashboardCardTemplatableClassMetadata,
    TemplateCreatorOrganization,
    TemplateViewClassification
} from "ngx-card-deck";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import { CardResourceInjectionTokenValue } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";

@Component({
    selector: 'demo-sample1-client-metrics-billboard-template',
    templateUrl: './demo-client-metrics-billboard-template.html'
})
export class DemoClientMetricsBillboardTemplateComponent extends CardPluginTemplateBase implements OnInit {

    // annotation stamped at class level
    public static classification: DashboardCardTemplatableClassMetadata = {
        organization: new TemplateCreatorOrganization(demoDashboardVendorClassificationMap['2'], "metrics billboard template")
    };

    constructor(// interface token conformance requirement
        @Inject(forwardRef(() => CARD_RESOURCE_TOKEN)) public resourceToken: CardResourceInjectionTokenValue,
        @Inject(MetricsBillboardComponent) public cardAssemblyPlugin: MetricsBillboardComponent<any, any, any, any>, // implements DashboardCardPluggable

        _dashboardComponent: DashboardComponent,
        _globalState: GlobalStateBase,
        _element: ElementRef) {

        // todo: angular claims the constructor is inherited, why a manual injection? remove this needless constructor
        super(resourceToken, cardAssemblyPlugin, _dashboardComponent, _globalState, _element);

        // certification of template : who organized it
        // should only be ONE SINGLETON of the organization.
        // todo: supply collaborators to constructor as injectables - below is an antipattern
        this.templateOrganization = DemoClientMetricsBillboardTemplateComponent.classification.organization; // class level ref
        this.viewClassification = new TemplateViewClassification("billboard", "data billboard template container");

    }

    ngOnInit() {
        super.ngOnInit();

    }

    // +++++++++++++++++++ implementations over base class +++++++++++++++++++++++
    // via metadata : only this organization can consume and deal with the template. avoids cross pollination side effects
    public validateRenderTemplateMetadata(metadata: RelationalDataFieldRenderTemplate): boolean {
        return metadata && metadata.organization === this.templateOrganization.classification.organization;
    }

}

import { Component, ElementRef, Inject, OnInit, ViewEncapsulation } from "@angular/core";

import { DemoDashboardOrganizerPackageEnumeration } from "../../../../../../../integration/card-outlet/demo-dashboard-organizer-package.class";
import { RelationalDataFieldRenderTemplate } from "../../../../../../core/com.company.group/views/card-assembly-plugins/simple-grid-card/grid-relational-data-field-model.interface";
import { SummaryBillboardComponent } from "../../../../../../core/com.company.group/views/card-assembly-plugins/summary-billboard/summary-billboard.component";
import {
    CardResourceInjectionTokenValue,
    VendorClassificationItem
} from "ngx-card-deck";
import { CardPluginTemplateBase } from "ngx-card-deck";
import {
    DashboardCardTemplatable,
    DashboardCardTemplatableClassMetadata,
    TemplateCreatorOrganization,
    TemplateViewClassification
} from "ngx-card-deck";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";


const vci: VendorClassificationItem = {
   organizerPackage: DemoDashboardOrganizerPackageEnumeration.com_company_sample1,
   organization: "project2",
   description: "Sample 1: Summary Billboard Template"
};


@Component({
   selector: 'demo-sample1-summary-billboard-template',
   templateUrl: './demo-client-summary-billboard-template.html',
   styleUrls: ['./demo-client-summary-billboard-template.scss'],
   encapsulation: ViewEncapsulation.None
})
export class DemoClientSummaryBillboardTemplateComponent extends CardPluginTemplateBase implements DashboardCardTemplatable, OnInit {

   // annotation stamped at class level
   public static classification: DashboardCardTemplatableClassMetadata = {
      // why can't link be made?
      organization: new TemplateCreatorOrganization(vci, "placeholder organization")
   };

   /// -------
   constructor(// interface token conformance requirement

      @Inject(CARD_RESOURCE_TOKEN) public resourceToken: CardResourceInjectionTokenValue,
      @Inject(SummaryBillboardComponent) public cardAssemblyPlugin: SummaryBillboardComponent, // implements DashboardCardPluggable

      _dashboardComponent: DashboardComponent,
      _globalState: GlobalStateBase,
      _element: ElementRef) {

      super(resourceToken, cardAssemblyPlugin, _dashboardComponent, _globalState, _element);

      // certification of template : who organized it
      // should only be ONE SINGLETON of the organization.
      this.templateOrganization = DemoClientSummaryBillboardTemplateComponent.classification.organization; // class level ref
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

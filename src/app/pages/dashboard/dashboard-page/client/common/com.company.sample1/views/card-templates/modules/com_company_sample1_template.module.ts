import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ClrDatagridModule, ClrIconModule } from "@clr/angular";
import { DemoClientGridCardIconDirective } from "../components/demo-client-grid-card/demo-client-grid-card-icon.directive";
import { DemoClientGridCardTemplateComponent } from "../components/demo-client-grid-card/demo-client-grid-card-template.component";
import { DemoClientSummaryBillboardTemplateComponent } from "../components/demo-client-summary-billboard/demo-client-summary-billboard-template.component";

@NgModule({
   imports: [
      CommonModule,
      ClrIconModule,
      ClrDatagridModule // simple grid
   ],
   // compiler needs
   declarations: [
      DemoClientGridCardIconDirective, // simple grid
      DemoClientSummaryBillboardTemplateComponent,
      DemoClientGridCardTemplateComponent
   ],

   // dynamic injection
   entryComponents: [
      DemoClientSummaryBillboardTemplateComponent,
      DemoClientGridCardTemplateComponent
   ],

   providers: []

})
export class ComCompanySample1TemplateModule {
}



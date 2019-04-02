import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgressMeterDirective } from "../../../../../../core/com.company.group/views/card-assembly-plugins/metrics-billboard/directives/progress-meter.directive";
import { DemoClientMetricsBillboardTemplateComponent } from "./demo-client-metrics-billboard-template.component";

@NgModule({
   imports: [
      CommonModule
   ],
   // compiler needs
   declarations: [
      ProgressMeterDirective,
      DemoClientMetricsBillboardTemplateComponent
   ],

   // dynamic injection
   entryComponents: [
      DemoClientMetricsBillboardTemplateComponent
   ],

   providers: []

})
export class DemoClientMetricsBillboardTemplateModule {
}



import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ClrDatepickerModule, ClrIconModule, ClrTabsModule } from "@clr/angular";
import { SimpleIntroductionTemplateComponent } from "../components/simple-introduction/simple-introduction-template.component";

// statically discoverable module block
@NgModule({
    imports: [
        CommonModule,
        ClrIconModule,
        ClrDatepickerModule,
        ClrTabsModule,
    ],
    // compiler needs
    declarations: [
        SimpleIntroductionTemplateComponent
    ],

    // dynamic injection
    entryComponents: [
        SimpleIntroductionTemplateComponent
    ],

    providers: []

})
export class ComCompanySample3TemplateModule {
}



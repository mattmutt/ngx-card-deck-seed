import { Component, ElementRef, forwardRef, Inject, OnInit, Renderer2 } from "@angular/core";
import { CARD_RESOURCE_TOKEN } from "ngx-card-deck";
import { GlobalStateBase } from "ngx-card-deck";
import { DashboardComponent } from "ngx-card-deck";
import { CardResourceInjectionTokenValue } from "ngx-card-deck";
import {
    DashboardCardTemplatableClassMetadata,
    TemplateCreatorOrganization,
    TemplateViewClassification
} from "ngx-card-deck";
import { demoDashboardVendorClassificationMap } from "../../../../../../../../integration/card-outlet/demo-dashboard-vendor-classification.class";
import { StandardCardPluginTemplateBase } from "../../../../../../standard/card-outlet/card-assembly-plugins/base/standard-card-plugin-template-base";
import { IntroductionComponent } from "../../../card-assembly-plugins/introduction/introduction.component";
import { IntroductionCardAssemblyPluginModel } from "../../../card-assembly-plugins/introduction/introduction.model";


@Component({
    templateUrl: "simple-introduction-template.html",
})
export class SimpleIntroductionTemplateComponent extends StandardCardPluginTemplateBase implements OnInit {
    // annotation stamped at class level
    static classification: DashboardCardTemplatableClassMetadata = {
        organization: new TemplateCreatorOrganization(demoDashboardVendorClassificationMap.custom_sample, "custom sample presentation template")
    };

    // template: pass reference from plugin
    cardModel: IntroductionCardAssemblyPluginModel;


    // subviews state
    viewState = {
        detailsPane: {visible: true}, // debug: simple color change upon clicking icon
    };

    constructor(// interface token conformance requirement
        @Inject(forwardRef(() => CARD_RESOURCE_TOKEN)) public resourceToken: CardResourceInjectionTokenValue,
        @Inject(IntroductionComponent) public cardAssemblyPlugin: IntroductionComponent<any, any, any, any>,
        _dashboardComponent: DashboardComponent,
        _globalState: GlobalStateBase,
        _renderer: Renderer2,
        _element: ElementRef,
    ) {
        super(resourceToken, cardAssemblyPlugin, _dashboardComponent, _globalState, _element);

        this.templateOrganization = SimpleIntroductionTemplateComponent.classification.organization;
        this.viewClassification = new TemplateViewClassification("presentation", "presentational layer");

    }

    // ~~~~~~~~~~ user interaction ~~~~~~~~~~~~~

    ngOnInit() {
        super.ngOnInit(); // presume that base class has lifecycle logic
        this.initialize();
    }

    // -------- user interaction ------------
    onToggleViewPane(viewStateItemRef: { visible: boolean }) {
        viewStateItemRef.visible = !viewStateItemRef.visible;
        console.log("click!!");
    }

    // user to dispatch typed in message
    onSendMessage(field: HTMLInputElement, evt: Event) {
        if (field.value.length > 1) {
            this.cardAssemblyPlugin.onBroadcastCardMessage(field.value);
            field.value = "";
        }
    }

    private initialize() {
    }


}

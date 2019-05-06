import { DemoDashboardPageComponent } from "./demo-dashboard-page.component";
import {
    DashboardConfigurationFacadeService,
    ViewAssemblyTypeStateResourceLayoutItemSchema
} from "ngx-card-deck";
import { Injectable } from "@angular/core";

//import { NodeflowConfigurationPreprocessor } from "./client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.class";

const resources = {
    action: {}
};


@Injectable()
export class DemoDashboardTransactionAgentService {


    private component: DemoDashboardPageComponent;

    // to decide if the card preprocessor is needed? probably should not hardcode the Nodeflow implementation
    // private cardConfigurationPreprocessor: NodeflowConfigurationPreprocessor;
    //  this.cardConfigurationPreprocessor = new NodeflowConfigurationPreprocessor();

    constructor(private configurationFacadeService: DashboardConfigurationFacadeService) {
    }

    setComponent(c: DemoDashboardPageComponent) {
        this.component = c;
    }


    // ======================= Standard card Actions ===================

    onShowVisibleCardsInfo(itemList: Array<ViewAssemblyTypeStateResourceLayoutItemSchema>, evt: MouseEvent) {
        const msg = itemList.map((item) => `* ${item.resourceId}`).join("\n");
        alert(msg);
    }

}

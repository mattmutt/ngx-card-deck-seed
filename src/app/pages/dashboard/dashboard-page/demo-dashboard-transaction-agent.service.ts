import { DemoDashboardPageComponent } from "./demo-dashboard-page.component";
import {
    DashboardConfigurationFacadeService,
    ViewAssemblyTypeStateResourceLayoutItemSchema
} from "ngx-card-deck";
import { Injectable } from "@angular/core";
import { NodeflowConfigurationPreprocessor } from "./client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.class";


const resources = {
    action: {}
};


@Injectable()
export class DemoDashboardTransactionAgentService {


    private component: DemoDashboardPageComponent;

    private cardConfigurationPreprocessor: NodeflowConfigurationPreprocessor;

    constructor(private configurationFacadeService: DashboardConfigurationFacadeService) {
        this.cardConfigurationPreprocessor = new NodeflowConfigurationPreprocessor();
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


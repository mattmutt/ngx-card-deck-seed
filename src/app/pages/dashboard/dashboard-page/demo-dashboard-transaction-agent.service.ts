import { DemoDashboardPageComponent } from "./demo-dashboard-page.component";
import {
    DashboardConfigurationFacadeService,
    ViewAssemblyTypeStateResourceLayoutItemSchema
} from "ngx-card-deck";
import { Injectable } from "@angular/core";


const resources = {
    action: {}
};


@Injectable()
export class DemoDashboardTransactionAgentService {


    private component: DemoDashboardPageComponent;


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


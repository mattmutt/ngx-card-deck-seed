import { NgModule } from "@angular/core";
import { DomInteractionService } from "./dom-interaction.service";
import { BrowserUserAgentService } from "./browser-user-agent.service";

@NgModule({
    providers: [DomInteractionService, BrowserUserAgentService]
})
export class BrowserToolingModule {
}

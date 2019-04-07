import { Injectable } from "@angular/core";


// Cross browser inspection tools
@Injectable()
export class BrowserUserAgentService {

    isMicrosoftBrowser(): boolean {
        return window.navigator.appName === "Netscape" && window.navigator.userAgent.indexOf("Edge/") > 0;
    }

}

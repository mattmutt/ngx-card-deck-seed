import { Component } from '@angular/core';
import * as appNavigationLinksResourceJson from "./app-navigation-links.json";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'ngx Card Deck Demo';
    navigationLayout: any = appNavigationLinksResourceJson.default;
}

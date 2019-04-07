import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule, ClrTabsModule, ClrTooltipModule } from "@clr/angular";
import { AppComponent } from './app.component';
import * as appNavigationLinksResourceJson from "./app-navigation-links.json";

describe('AppComponent', () => {
    beforeEach(async(() => {

        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                ClarityModule,
                ClrTooltipModule,
                ClrTabsModule,
            ],
            declarations: [
                AppComponent
            ],
        }).compileComponents();
    }));
    it('should create the app', async(() => {
        const fixture = TestBed.createComponent<AppComponent>(AppComponent);
        fixture.componentInstance.navigationLayout = appNavigationLinksResourceJson;

        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

    it(`should have as title 'ngx Card Deck Demo'`, async(() => {
        const fixture = TestBed.createComponent<AppComponent>(AppComponent);
        fixture.componentInstance.navigationLayout = appNavigationLinksResourceJson;

        fixture.detectChanges();
        const app = fixture.debugElement.componentInstance;
        const title = 'ngx Card Deck Demo';
        expect(app.title).toEqual(title);
    }));

});


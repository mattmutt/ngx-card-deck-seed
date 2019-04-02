import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ClrIconModule, ClrTabsModule, ClrTooltipModule } from "@clr/angular";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from "./about/about.component";
import { AppThemeService, ThemePreloadFactory } from "./app-theme.service";
import { environment } from "../environments/environment";


@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        ClrIconModule,
        ClrTooltipModule,
        ClrTabsModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        AboutComponent
    ],
    providers: [
        AppThemeService,
        {
            provide: "APP_ENVIRONMENT", // string token to promote loose coupling
            useValue: environment
        },
        {
            provide: APP_INITIALIZER,
            useFactory: ThemePreloadFactory,
            multi: true,
            deps: [AppThemeService, "APP_ENVIRONMENT"]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { Observable, Subject } from "rxjs";
import { startWith } from "rxjs/operators";

const resources = {
    tag: {
        identifier: "theme-service-clarity"
    },
    themes: {
        clarity: {
            true: "standard-light-theme",
            false: "standard-dark-theme"
        }
    },
    links: {
        clarity: {
            true: "clr-ui.min.css",
            false: "clr-ui-dark.min.css",
        }
    }
};


// Angular preloader hook
export function ThemePreloadFactory(service: AppThemeService, appEnvironment: any) {

    return () => service
        .initializeTheme(appEnvironment)
        .then()
        .catch((e) => new Promise((resolve, reject) => resolve(false)));
}


// versatile switching of themes. Currently supports Clarity. Support of other libraries feasible
@Injectable()
export class AppThemeService {

    themeStateFlag = true; // default to light

    private rootElement: HTMLElement;
    private environment: any;
    private themeChangeSubject$ = new Subject<boolean>();

    constructor(@Inject(DOCUMENT) public dom: Document) {
    }


    // simply two themes for now, easy to scale to more
    // The real application may place the theme annotation somewhere else in the page
    changeTheme(isLightTheme: boolean) {

        this.themeStateFlag = isLightTheme;
        this.rootElement.classList.remove(...Object.values(resources.themes.clarity));
        this.rootElement.classList.add(resources.themes.clarity["" + this.themeStateFlag]);

        // notify watchers
        this.loadExternalStyles(resources.links.clarity["" + isLightTheme]).then(() =>
            this.themeChangeSubject$.next(isLightTheme));
    }


    // inspects the initial page setup that should statically define the preferred theme
    initializeTheme(environment: any): Promise<boolean> {
        this.environment = environment;
        this.rootElement = this.dom.documentElement;

        Object.keys(resources.themes.clarity).some((themeIsLightState) => {
            const matched = this.rootElement.classList.contains(resources.themes.clarity[themeIsLightState]);
            if (matched) {
                this.themeStateFlag = themeIsLightState === "true";
                this.loadExternalStyles(resources.links.clarity["" + this.themeStateFlag]);
            }
            return matched;
        });

        return Promise.resolve(true);
    }

    onChange$(): Observable<boolean> {
        return this.themeChangeSubject$.pipe(startWith(this.themeStateFlag));
    }


    private loadExternalStyles(styleUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const onLoaded = () => resolve();
            const themeStylesheetTag = this.dom.getElementById(resources.tag.identifier) as HTMLLinkElement;

            if (!themeStylesheetTag) {
                const styleElement = this.rootElement.ownerDocument!.createElement("link");
                styleElement.id = resources.tag.identifier;
                styleElement.rel = "stylesheet";
                styleElement.href = styleUrl;
                styleElement.onload = onLoaded;

                this.rootElement.ownerDocument!.head.appendChild(styleElement);
            } else {
                // existing, just toggle href link
                themeStylesheetTag.href = styleUrl;
                onLoaded(); // onload can't be reused
            }
        });
    }


}

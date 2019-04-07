import { TemplateRef } from "@angular/core";

// reassign template
export interface ContentProjectionProxyCommand {
    clientContext?: any; // preserve state at the time of invocation

    onLayout(): void;

    close(): boolean;
}

export type ContentProjectionProxyReplacerType = (outletTemplateRefName: string, contentTemplate: TemplateRef<any>, templateBoundContext: object, replacementPropertiesMap: object) => ContentProjectionProxyCommand;


export interface OverlayViewProjectable {

    proxyCommand: ContentProjectionProxyCommand | undefined;

    show(...args: Array<any>): boolean;

    hide(...args: Array<any>): boolean;

}

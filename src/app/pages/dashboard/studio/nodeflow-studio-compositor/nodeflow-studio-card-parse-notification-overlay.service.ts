import { Injectable, TemplateRef } from "@angular/core";
import { CardSubjectsParseValidatorManager } from "./state/model/collection/card-node-validator-subjects.model";
import {
    ContentProjectionProxyCommand,
    ContentProjectionProxyReplacerType,
    OverlayViewProjectable
} from "./views/overlays/nodeflow-studio-overlay-template.interface";


const resources = {
    debug: false, // turn on warning messages for better understanding
    outletTemplateName: "visibleNotificationTemplate",
    autoCloseDelay: 10 * 1000 // dont leave it up forever
};



@Injectable()
export class NodeflowStudioCardParseNotificationOverlayService implements OverlayViewProjectable {

    proxyCommand: ContentProjectionProxyCommand | undefined; // lifecycle

    private contentTemplate: TemplateRef<any>; // general layout
    private templatePropertyMap: object;
    private autoCloserTaskId: number; // cancellable
    private templateReplacerProxy: ContentProjectionProxyReplacerType;

    public initialize(outletTemplateProxy: ContentProjectionProxyReplacerType, contentTemplate: TemplateRef<any>, templatePropertyMap: object) {
        this.templateReplacerProxy = outletTemplateProxy;
        this.contentTemplate = contentTemplate;
        this.templatePropertyMap = templatePropertyMap;
    }

    public process(validator: CardSubjectsParseValidatorManager) {
        if (resources.debug && !validator.validStatus) {
            const openedWorked = this.show(this.generateTitleBinding(validator), this.generateMessageBinding(validator));
            if (!openedWorked) {
                console.error("template already visible, cannot interact while open");
            }
        }
    }

    // attempts to hide an overlay if showing
    public show(title: string, messages: Array<string>): boolean {

        if (this.proxyCommand) {
            return false;
        }

        this.proxyCommand = this.templateReplacerProxy(resources.outletTemplateName, this.contentTemplate, this.templatePropertyMap,
            {
                "title": title,
                "messages": messages
            });

        if (resources.autoCloseDelay) {
            this.autoCloserTaskId = window.setTimeout(() => this.hide(), resources.autoCloseDelay);
        }


        return true;
    }

    // attempts to hide an overlay if showing
    public hide(): boolean {

        if (this.proxyCommand) {
            const actionPerformed = this.proxyCommand.close();
            if (actionPerformed) {
                this.proxyCommand = undefined;
                window.clearTimeout(this.autoCloserTaskId);
                this.autoCloserTaskId = undefined as any;
            }
            return actionPerformed;
        }
        return false;
    }

    private generateTitleBinding(validator: CardSubjectsParseValidatorManager): string {
        return "Warnings: " + validator.errorValidationCount;
    }

    private generateMessageBinding(validator: CardSubjectsParseValidatorManager): Array<string> {
        const msgList: Array<string> = [];

        for (const nodeValidator of validator.subjects) {
            for (const validation of nodeValidator.validations) {
                if (!validation.status) {
                    msgList.push(validation.message);
                }
            }

        }

        return msgList;

    }


}

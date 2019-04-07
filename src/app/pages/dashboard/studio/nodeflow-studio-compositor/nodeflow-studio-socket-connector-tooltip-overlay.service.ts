import { Injectable, TemplateRef } from "@angular/core";
import {
    ContentProjectionProxyCommand,
    ContentProjectionProxyReplacerType,
    OverlayViewProjectable
} from "./views/overlays/nodeflow-studio-overlay-template.interface";
import { SocketModel } from "./state/model/socket.model";
import { NodeModel } from "./state/model/node.model";


const resources = {
    debug: false, // turn on warning messages for better understanding
    outletTemplateName: "visibleTooltipTemplate",
    openDelay: 500, // avoid annoying side effects during mouse roll overs
    autoCloseDelay: 0
};


@Injectable()
export class NodeflowStudioSocketConnectorTooltipOverlayService implements OverlayViewProjectable {

    proxyCommand: ContentProjectionProxyCommand | undefined; // lifecycle

    private contentTemplate: TemplateRef<any>; // general layout
    private templatePropertyMap: object;
    private openDelayTaskId: number; // cancellable
    private autoCloserTaskId: number; // cancellable
    private templateReplacerProxy: ContentProjectionProxyReplacerType;

    public initialize(outletTemplateProxy: ContentProjectionProxyReplacerType, contentTemplate: TemplateRef<any>, templatePropertyMap: object) {
        this.templateReplacerProxy = outletTemplateProxy;
        this.contentTemplate = contentTemplate;
        this.templatePropertyMap = templatePropertyMap;
    }

    // attempts to hide an overlay if showing
    public show(socket: SocketModel, node: NodeModel, triggerElement: EventTarget | null): boolean {

        if (this.proxyCommand) {
            return false;
        }
        if (!triggerElement) {
            return false;
        }

        this.openDelayTaskId = window.setTimeout(() => {

            this.proxyCommand = this.templateReplacerProxy(resources.outletTemplateName, this.contentTemplate, this.templatePropertyMap,
                {
                    socket,
                    node,
                    triggerElement
                });
            this.proxyCommand.clientContext = {socket};

            if (resources.autoCloseDelay) {
                this.autoCloserTaskId = window.setTimeout(() => this.hide(), resources.autoCloseDelay);
            }

            this.proxyCommand.onLayout();
        }, resources.openDelay);

        return true;
    }

    // attempts to hide an overlay if showing
    public hide(): boolean {

        // when swiftly moving mouse, cancel the tooltip
        if (this.openDelayTaskId) {
            clearTimeout(this.openDelayTaskId);
            delete this.openDelayTaskId;
        }

        if (this.proxyCommand) {

            const actionPerformed = this.proxyCommand.close();
            if (actionPerformed) {
                delete this.proxyCommand.clientContext;
                this.proxyCommand = undefined;
                // window.clearTimeout(this.autoCloserTaskId);
                this.autoCloserTaskId = undefined as any;
            }
            return actionPerformed;
        }
        return false;
    }

    /*
    private generateTitleBinding(validator: CardSubjectsParseValidatorManager): string {
        return "Socket: " + validator.errorValidationCount;
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
    */


}

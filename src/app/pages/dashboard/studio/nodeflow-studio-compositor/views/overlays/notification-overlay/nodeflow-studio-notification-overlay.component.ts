import { AfterViewInit, Component, ElementRef, Input, OnDestroy, Renderer2 } from "@angular/core";
import { ContentProjectionProxyCommand } from "../nodeflow-studio-overlay-template.interface";


const resources = {

    layout: {
        offsetFromTrigger: 5,
        showingClass: "show",
        triggerShowingDelay: 100,
        width: 50,
        maxWidth: 100,
        height: 20,
        maxHeight: 40
    }
};

@Component({
    selector: 'nodeflow-studio-notification-overlay',
    templateUrl: './nodeflow-studio-notification-overlay.html',
    styleUrls: ['./nodeflow-studio-notification-overlay.scss']
})
export class NodeflowStudioNotificationOverlayComponent implements OnDestroy, AfterViewInit {
    contentBoundingBox: ClientRect;

    @Input() title: string | undefined;
    @Input() messages: Array<string> | undefined;
    @Input() overlayCommand: ContentProjectionProxyCommand; // standard by contract


    constructor(
        private element: ElementRef,
        private renderer: Renderer2
    ) {

    }

    ngAfterViewInit() {
        this.contentBoundingBox = (this.element.nativeElement as HTMLDivElement).getBoundingClientRect();

        // slight wait before showing tooltip
        setTimeout(() => {
            this.renderer.addClass(this.element.nativeElement, resources.layout.showingClass);
        }, resources.layout.triggerShowingDelay);

    }

    ngOnDestroy() {

    }

}


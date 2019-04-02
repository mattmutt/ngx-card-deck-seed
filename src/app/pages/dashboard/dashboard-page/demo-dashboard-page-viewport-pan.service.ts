import { Injectable, NgZone } from '@angular/core';
import { DemoDashboardPageComponent } from "./demo-dashboard-page.component";

interface ViewportPositionSnapshotSchema {
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
}

@Injectable()
export class DemoDashboardPageViewportPanService {

    public isDragging = false;

    private viewportContainerPage: DemoDashboardPageComponent;
    private positionSnapshot: ViewportPositionSnapshotSchema = {x: 0, y: 9, scrollLeft: 0, scrollTop: 0};

    constructor(private zone: NgZone) {
    }

    public setDashboardViewportPage(page: DemoDashboardPageComponent): void {
        this.viewportContainerPage = page;
    }

    public prepareMouseEvents(targetElement: HTMLElement) {
        this.zone.runOutsideAngular(() => {
            targetElement.addEventListener('mousedown', this.mouseDownEvent);
        });
    }

    public cleanupMouseEvents(targetElement: HTMLElement) {
        targetElement.removeEventListener('mousemove', this.mouseMoveEvent);
        targetElement.removeEventListener('mousedown', this.mouseDownEvent);
        this.isDragging = false;
    }

    /**
     * respecting document layout direction, determine if the targeted HTML element is having its scrollbar clicked
     */
    private isMouseOverElementScrollbar(evt: MouseEvent, targetElement: HTMLElement): boolean {
        const elemBCR = (evt.target as HTMLElement).getBoundingClientRect();
        const isLTR = (targetElement.ownerDocument!.defaultView!.getComputedStyle(targetElement).direction === "ltr");

        if (elemBCR.width !== (evt.target as HTMLElement).clientWidth) {
            const scrollbarDimension = elemBCR.width - (evt.target as HTMLElement).clientWidth;

            if (isLTR && evt.offsetX >= (elemBCR.width - scrollbarDimension)) {
                return true;
            }
        }
        if (elemBCR.height !== (evt.target as HTMLElement).clientHeight) {
            const scrollbarDimension = elemBCR.height - (evt.target as HTMLElement).clientHeight;

            if (evt.offsetY >= (elemBCR.height - scrollbarDimension)) {
                return true;
            }
        }

        return false;
    }

    // DOM Events
    private mouseDownEvent = (evt: MouseEvent) => {
        const strategy = this.viewportContainerPage.gridContainerAssemblyInstance;
        if (strategy) {
            const g = strategy.gridWidget;

            if (!g.dragInProgress) {

                if (evt.target === g.el && !this.isMouseOverElementScrollbar(evt, evt.target as HTMLElement)) {

                    this.zone.run(() => {
                        this.isDragging = true; // state transition
                    });

                    // start drag until mouse up
                    this.positionSnapshot.x = evt.clientX;
                    this.positionSnapshot.y = evt.clientY;
                    this.positionSnapshot.scrollLeft = g.el.scrollLeft;
                    this.positionSnapshot.scrollTop = g.el.scrollTop;

                    this.viewportContainerPage.dashboardInstanceViewContainerRef.element.nativeElement.addEventListener('mousemove', this.mouseMoveEvent);
                }
            }
            evt.preventDefault();
        }

    };

    private mouseMoveEvent = (evt: MouseEvent) => {
        evt.preventDefault();

        const strategy = this.viewportContainerPage.gridContainerAssemblyInstance;
        if (strategy) {
            const g = strategy.gridWidget;

            // ignore if working on grid items (cards)
            if (!g.dragInProgress) {

                if (this.isDragging) {
                    if (evt.buttons === 1) { // not `button` property, want to ensure a drag is in effect
                        if (evt.target === g.el) {
                            // start drag until mouse up
                            const factor = 1;
                            const newX = evt.clientX - this.positionSnapshot.x;
                            const newY = evt.clientY - this.positionSnapshot.y;
                            g.el.scrollLeft = this.positionSnapshot.scrollLeft - (newX) * factor;
                            g.el.scrollTop = this.positionSnapshot.scrollTop - (newY) * factor;
                        }
                    }

                    if (evt.buttons === 0) { // mouse up anywhere

                        this.zone.run(() => {
                            this.isDragging = false; // state transition
                        });

                        this.positionSnapshot.x = this.positionSnapshot.y = 0;
                        this.viewportContainerPage.dashboardInstanceViewContainerRef.element.nativeElement.removeEventListener('mousemove', this.mouseMoveEvent);
                    }
                }

            }
        }

    };


}

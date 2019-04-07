import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { DOMInteractionMovementEvents, DomInteractionService } from "./utils/browser/dom-interaction.service";

const resources = {
    slowdown: 16 / 2
};

// works on rearranging socket when already connected to an existing relation
@Injectable()
export class NodeflowStudioSocketConnectorDragService {

    isDraggingState = false;
    draggableAvatarStateClass = "hidden"; // initial
    clientDragInteractionMonitor: DOMInteractionMovementEvents; // monitor
    clientDragDisposableSubject$: Subject<boolean> = new Subject(); // notify termination

    clientDragInteractionUnderlay: HTMLElement; // underlay
    sourceDraggableAvatarContainerElement: HTMLElement; // the draggable zone, likely the graphing container on the right side

    // sourceDraggableAvatarContainerElementResizeObserver:
    //     | ResizeObserver
    //     | undefined; // dimension size changes ( splitter )

    activeMenuListItemElement: HTMLLIElement | undefined; // when clicking a leaf menu item
//    latestMovementCoordinates$: BehaviorSubject<DOMInteractionMovementDimension | undefined> = new BehaviorSubject(undefined);

    constructor(
        private domInteractionService: DomInteractionService
    ) {

    }


    /*
    start(connector: SocketConnectorRelationModel, triggerSocket: SocketModel, startTriggerEvent: MouseEvent) {

        const avatarBoxDimension = this.draggableAvatar.deriveBoundingClientRect();

        this.clientDragInteractionMonitor = this.domInteractionService.getInteractionMovementEventStreams(
            this.draggableAvatar.nativeElement,
            resources.slowdown,
            this.clientDragDisposableSubject$, true
        );

        this.clientDragInteractionMonitor.moves.forEach(coordinateSpace => {
            // console.log('Moved to', coordinate.x, coordinate.y);
            this.latestMovementCoordinates$.next(coordinateSpace); // preserve latest
            this.domInteractionService.positionDragElement(
                this.draggableAvatar.nativeElement,
                avatarBoxDimension,
                coordinateSpace,
                this.clientDragInteractionUnderlay,
                true
            );
        });

        this.toggleDraggingViewState(true);

        // one tick to set best position, accounting for constraints
        setTimeout(() => {
            this.domInteractionService.positionDragElement(
                this.draggableAvatar.nativeElement,
                avatarBoxDimension,
                {
                    x: startTriggerEvent.clientX,
                    y: startTriggerEvent.clientY
                },
                this.clientDragInteractionUnderlay,
                true
            );
        }, 0);
    }
    */


}


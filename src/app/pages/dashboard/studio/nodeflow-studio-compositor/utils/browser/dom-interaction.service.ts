import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { debounceTime, map, takeUntil } from "rxjs/operators";
import { fromEvent, HasEventTargetAddRemove } from "rxjs/internal/observable/fromEvent";

export interface DOMInteractionMovementDimension {
    x: number;
    y: number;
}

export interface DOMInteractionMovementEvents {
    starts: Observable<DOMInteractionMovementDimension>;
    moves: Observable<DOMInteractionMovementDimension>;
    ends: Observable<DOMInteractionMovementDimension>;
}

const resources = {
    underlay: {
        position: "absolute",
        backgroundColor: "rgba(0,0,0,.2)"
    }
};

// extensive DOM Utilities for advanced user interactions
@Injectable()
export class DomInteractionService {


    /**
     * stream of mouse and gesture interaction events
     * abstracts whether it is mouse or mobile-touch based cleanly. Notice the start, in progress and end states
     * domItem - start recording by watching an web element
     * slowdownDuration - monitoring can be taxing, so slow down emissions
     * disposableSubject$ - termination accessor
     */
    public getInteractionMovementEventStreams(
        domItem: HTMLDivElement,
        slowdownDuration: number,
        disposableSubject$: Subject<any>,
        isMouseMovementFlag: boolean = true
    ): DOMInteractionMovementEvents {


        const movement = isMouseMovementFlag
            ? this.generateMouseInteractionsMovementEvents(domItem)
            : this.generateTouchInteractionsMovementEvents(domItem);

        return {
            starts: movement.starts,
            moves: movement.moves.pipe(debounceTime(slowdownDuration), takeUntil(disposableSubject$)),
            ends: movement.ends
        };

    }

    /**
     * positioning logic for centering a drag avatar under a coordinate system ( current finger or mouse position)
     */
    public positionDragElement(
        dragElement: HTMLElement,
        derivedElementDimension: DOMRectInit,
        coordinate: DOMInteractionMovementDimension,
        constrainingBoundaryElement: HTMLElement,
        isDragElementConstrained: boolean
    ) {
        const boundaryRect = constrainingBoundaryElement.getBoundingClientRect();

        const isAvatarCenteredToCoordinate = true;
        const derivedElementOffsetPositioningFactor = isAvatarCenteredToCoordinate
            ? 2
            : 1;

        // initially, center over cursor
        const avatarDimension = {
            x:
            coordinate.x -
            derivedElementDimension.width! /
            derivedElementOffsetPositioningFactor,
            y:
            coordinate.y -
            derivedElementDimension.height! /
            derivedElementOffsetPositioningFactor
        };

        // permit dragging avatar element to be confined to the dimension of `constrainingBoundaryElement`
        if (isDragElementConstrained) {
            // vertical boundary check
            if (
                coordinate.y <
                boundaryRect.top +
                derivedElementDimension.height! /
                derivedElementOffsetPositioningFactor
            ) {
                avatarDimension.y = boundaryRect.top;
            } else if (
                coordinate.y >
                boundaryRect.bottom -
                derivedElementDimension.height! /
                derivedElementOffsetPositioningFactor
            ) {
                avatarDimension.y =
                    boundaryRect.bottom - derivedElementDimension.height!;
            }

            // horizontal boundary check
            if (
                coordinate.x <
                boundaryRect.left +
                derivedElementDimension.width! /
                derivedElementOffsetPositioningFactor
            ) {
                avatarDimension.x = boundaryRect.left;
            } else if (
                coordinate.x >
                boundaryRect.right -
                derivedElementDimension.width! /
                derivedElementOffsetPositioningFactor
            ) {
                avatarDimension.x =
                    boundaryRect.right - derivedElementDimension.width!;
            }
        }

        // tslint:disable-next-line:no-bitwise
        dragElement.style.left = (avatarDimension.x >> 0) + "px";
        // tslint:disable-next-line:no-bitwise
        dragElement.style.top = (avatarDimension.y >> 0) + "px";
    }

    /**
     * underlay goes slightly under the draggable avatar layer to prevent triggering inadvertent selects and hovers
     */
    public createMovementConstrainingElement(
        draggableAreaRefElement: HTMLElement,
        decoratedClassName: string
    ): HTMLDivElement {
        const underlay = draggableAreaRefElement.ownerDocument!.createElement(
            "div"
        );

        underlay.className = decoratedClassName;
        underlay.style.position = resources.underlay.position;
        underlay.style.backgroundColor = resources.underlay.backgroundColor;

        draggableAreaRefElement.ownerDocument!.body.appendChild(underlay);
        return underlay;
    }

    public removeMovementConstrainingElement(underlay: HTMLElement): boolean {
        if (underlay) {
            underlay.ownerDocument!.body.removeChild(underlay);
            return true;
        }
        return false;
    }

    /**
     *  map the bounding box coordinates dimensions from one element to an intended target
     */
    public synchronizeElementsClientRect(
        sourceElem: HTMLElement,
        targetElem: HTMLElement
    ) {
        const bcr = sourceElem.getBoundingClientRect();
        const tes = targetElem.style;
        const positionedUnit = "px";

        tes.top = bcr.top + positionedUnit;
        tes.left = bcr.left + positionedUnit;
        tes.width = bcr.width + positionedUnit;
        tes.height = bcr.height + positionedUnit;
    }

    // mouse implementation generalized
    private generateMouseInteractionsMovementEvents(domItem: HTMLDivElement): DOMInteractionMovementEvents {

        const mouseEventToCoordinate = (
            mouseEvent: MouseEvent
        ): DOMInteractionMovementDimension => {
            mouseEvent.preventDefault();
            return {
                x: mouseEvent.clientX,
                y: mouseEvent.clientY
            };
        };

        const [mouseDowns, mouseMoves, mouseUps] = [
            fromEvent<MouseEvent>(domItem as HasEventTargetAddRemove<any>, "mousedown"),
            fromEvent<MouseEvent>(domItem.ownerDocument!.defaultView as HasEventTargetAddRemove<any>, "mousemove"),
            fromEvent<MouseEvent>(domItem.ownerDocument!.defaultView as HasEventTargetAddRemove<any>, "mouseup")
        ].map(ob =>
            ob.pipe(map((evt: MouseEvent) => mouseEventToCoordinate(evt)))
        );

        return {
            starts: mouseDowns,
            moves: mouseMoves,
            ends: mouseUps
        } as DOMInteractionMovementEvents;
    }

    // touch device gesture implementation generalized
    private generateTouchInteractionsMovementEvents(domItem: HTMLDivElement): DOMInteractionMovementEvents {

        const touchEventToCoordinate = (
            touchEvent: TouchEvent
        ): DOMInteractionMovementDimension => {
            touchEvent.preventDefault();
            return {
                x: touchEvent.changedTouches[0].clientX,
                y: touchEvent.changedTouches[0].clientY
            };
        };

        // additional gesture support for touch/mobile devices
        const [touchStarts, touchMoves, touchEnds] = [
            fromEvent<TouchEvent>(domItem as HasEventTargetAddRemove<any>, "touchstart"),
            fromEvent<TouchEvent>(domItem as HasEventTargetAddRemove<any>, "touchmove"),
            fromEvent<TouchEvent>((domItem.ownerDocument!.defaultView) as HasEventTargetAddRemove<any>, "touchend")
        ].map(ob =>
            ob.pipe(map((evt: TouchEvent) => touchEventToCoordinate(evt)))
        );

        return {
            starts: touchStarts,
            moves: touchMoves,
            ends: touchEnds
        } as DOMInteractionMovementEvents;

    }
}

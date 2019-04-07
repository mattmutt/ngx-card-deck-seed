import { Injectable } from "@angular/core";
import { GridsterComponent } from "ngx-card-deck";

// layout routines just for canvas portion
@Injectable()
export class NodeflowStudioCanvasLayoutService {

    // if space permits fill the space to the larger container to give a seamless look on the underlay
    isParentContainerFilled = true;
    private gridWidget: GridsterComponent;

    constructor() {
    }

    setGridWidget(gw: GridsterComponent) {
        this.gridWidget = gw;
    }

    getGridMargin() {
        return this.gridWidget.$options.margin;
    }

    calculateWidth(): number {

        if (!this.gridWidget) {
            return 0;
        }

        //basis width
        const widthEvaluations = [Math.round(this.gridWidget.scaleInteractionEventCoordinate(this.gridWidget.curColWidth * this.gridWidget.columns) + this.getGridMargin())];

        if (this.isParentContainerFilled) {
            // optionally fill
            widthEvaluations.push(this.gridWidget.curWidth);
        }

        return Math.max.apply(Math, widthEvaluations);
    }

    calculateHeight(): number {
        if (!this.gridWidget) {
            return 0;
        }

        //basis height
        const heightEvaluations = [Math.round(this.gridWidget.scaleInteractionEventCoordinate(this.gridWidget.curRowHeight * this.gridWidget.rows) + this.getGridMargin())];

        if (this.isParentContainerFilled) {
            // optionally fill
            heightEvaluations.push(this.gridWidget.curHeight);
        }

        return Math.max.apply(Math, heightEvaluations);
    }

    /**
     * SVG util for transform and scaling
     */
    generateSVGTransformSpace(x: number, y: number, z?: number): string {
        return `translate(${x}, ${y})` + (z !== undefined ? ` scale(${z})` : "");
    }

    generateSVGRotateSpace(degree: number, originX: number, originY: number): string {
        return `rotate(` + [degree, originX, originY] + `)`;
    }


    // transform point to coordinate space. Optionally, relative scaling can be ignored
    filterScalarPoint(point: number, isScaled = true): number {
        if (point === 0) {
            return 0;
        }

        return isScaled ? point : this.gridWidget.descaleInteractionEventCoordinate(point);
    }

    // apply scaling to a point
    scalePoint(point: number): number {
        if (point === 0) {
           return 0;
        }
        return this.gridWidget.scaleInteractionEventCoordinate(point);

    }


}

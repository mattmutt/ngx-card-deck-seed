import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Inject, OnInit } from "@angular/core";
import { NodeflowAssetNodeTemplateComponent } from "../../../../nodeflow-asset-node-template.component";
import {
    NODEFLOW_PROJECT1_CONSUMER_TOPIC_COMPONENT_RESOURCE_TOKEN,
    NodeflowProject1ConsumerStateInjectable
} from "../../../../nodeflow-asset-node-token";

interface ChromaMessageStateDataSchema {
    red: number;
    green: number;
    blue: number;
}

const resources = {
    validation: {
        color: {
            minimum: 0x00,
            maximum: 0xff
        }
    }
};

@Component({
    selector: "nodeflow-asset-topics-color-consumer",
    templateUrl: "./nodeflow-asset-topics-color-consumer.html",
    styleUrls: ["./nodeflow-asset-topics-color-consumer.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowAssetTopicsColorConsumerComponent implements OnInit {

    constructor(
        @Inject(forwardRef(() => NODEFLOW_PROJECT1_CONSUMER_TOPIC_COMPONENT_RESOURCE_TOKEN)) public resourceState: NodeflowProject1ConsumerStateInjectable,
        @Inject(forwardRef(() => NodeflowAssetNodeTemplateComponent)) public integrator: NodeflowAssetNodeTemplateComponent,
        private _cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.initialize();
    }

    // template
    showMessageData(data: ChromaMessageStateDataSchema): string {
        return this.calculateFillColor(data);
    }

    // inspect the integrity and presence of actual data in the message stream
    // rule: all three color hues from the spectrum segments must be unsigned integers of 2 bytes
    validateMessageData(data: ChromaMessageStateDataSchema): boolean {

        return ![data.red, data.green, data.blue]
            .map((shade) => Number.isInteger(shade) && shade >= resources.validation.color.minimum && shade <= resources.validation.color.maximum)
            .includes(false);
    }

    calculateFillColor(data: ChromaMessageStateDataSchema): string {
        return this.toSVGColor(data.red, data.green, data.blue);
    }

    calculateStrokeColor(data: ChromaMessageStateDataSchema): string {
        const darken = 0.7;
        return this.toSVGColor(data.red * darken, data.green * darken, data.blue * darken);
    }


    // determine color or opacity-supported color
    private toSVGColor(red: number, green: number, blue: number, alpha: number = 1): string {
        [red, green, blue] = [red, green, blue].map(colorValue => this.constrain8Bit(colorValue));
        // tslint:disable-next-line:no-bitwise
        return alpha !== 1 ? `rgba( ${red >> 0},${green >> 0},${blue >> 0},${alpha})` : `rgb( ${red >> 0},${green >> 0},${blue >> 0})`;
    }

    private constrain8Bit(colorValue: number): number {
        return Math.max(0, Math.min(0xff, colorValue));
    }

    private initialize() {

        this.integrator.cardAssemblyPlugin.viewModel.onNodeConsumerRelationsChange$.subscribe((nodeOwnedRouteRelationList) => {
            // keep for debugging state mutation and external model changes
        });

    }
}

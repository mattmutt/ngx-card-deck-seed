import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable, Subject, merge, interval } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from "rxjs/operators";
import {
    NODEFLOW_PROJECT1_PRODUCER_TOPIC_COMPONENT_RESOURCE_TOKEN,
    NodeflowProject1ProducerStateInjectable
} from "../../../../nodeflow-asset-node-token";
import { MessageConnectorsRouteRelationModel } from "../../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { SocketConnectorRelationStateType } from "../../../../../../../../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";

enum EmitterPatternType {
    randomized = "randomized",
    brighten = "brighten",
    darken = "darken"
}


const resources = {
    stream: {debounce: 100}, // enforce decent throttling for animation to loop nicely.
    ranges: {minimum: 0, maximum: 255},
    fields: ["red", "green", "blue"],

    emitter: {
        // extra controls on the form to simulate time bound operations to pretend like some automation is occurring
        form: {
            active: false,
            interval: 1000,
            strategyType: EmitterPatternType.randomized
        }
    },

    types: {
        emitterPatternTypeMap: new Map([
            [EmitterPatternType.randomized.toString(), EmitterPatternType.randomized],
            [EmitterPatternType.brighten.toString(), EmitterPatternType.brighten],
            [EmitterPatternType.darken.toString(), EmitterPatternType.darken]
        ]) as Map<string, EmitterPatternType>,
        emitterPatternTypeList: [] as Array<[string, EmitterPatternType]>,
        emitterPatternTypeEnum: EmitterPatternType
    }

};

@Component({
    selector: "nodeflow-asset-topics-color-producer",
    templateUrl: "./nodeflow-asset-topics-color-producer.html",
    styleUrls: ["./nodeflow-asset-topics-color-producer.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowAssetTopicsColorProducerComponent implements OnInit {


    periodicEmitter$: Observable<any>;
    periodicEmitterIntervalChange$: Observable<number>;
    periodicEmitterCycleCount = 0;

    // lifecycles
    emitterEngineStart$ = new Subject<void>();
    emitterEngineStop$ = new Subject<void>();

    emitterForm: FormGroup;
    // model constraints on select form fields
    types = resources.types;


    constructor(
        @Inject(forwardRef(() => NODEFLOW_PROJECT1_PRODUCER_TOPIC_COMPONENT_RESOURCE_TOKEN)) public resourceState: NodeflowProject1ProducerStateInjectable,
        private fb: FormBuilder,
        private _cdr: ChangeDetectorRef
    ) {

        this.types.emitterPatternTypeList = Array.from(this.types.emitterPatternTypeMap);
    }

    ngOnInit() {
        this.initialize();
    }

    // select list dropdown option item, count of linked relations filtered by link state type
    calculateLinkStateTypeBundledSocketConnectorRelationCount(matchedRouteRelation: MessageConnectorsRouteRelationModel, linkStateType: SocketConnectorRelationStateType): number {
        return matchedRouteRelation.getSocketConnectorRelationListByStateType(linkStateType).length;
    }

    // CSS color units
    convertToHexColor(chromaType: string, value8Bit: number): string {
        const hues = {red: 0, green: 1, blue: 2};
        const spectrum = [0, 0, 0];
        spectrum[hues[chromaType]] = value8Bit;
        return `rgb(${spectrum})`;
    }

    // util: for values that are not yet defined, rule will hide
    isControlAttributeHidden(formControl: FormControl): boolean | null {
        return (formControl.value === null || formControl === undefined) ? true : null;
    }

    // stream orchestration to sync changes remotely to another node receiver
    private initialize() {

        this.createEmitterSubform();

        const subform = this.resourceState.integrator.simulatorProducerFormView.messagesForm.get(this.resourceState.message.form.component) as FormGroup;
        if (subform) {
            resources.fields.forEach((field) => {
                const control = subform.get(field);
                if (control) {
                    control.setValidators([Validators.max(resources.ranges.maximum), Validators.min(resources.ranges.minimum)]);
                    control.valueChanges.pipe(distinctUntilChanged(), debounceTime(resources.stream.debounce))
                        .subscribe(() => this.deliverSubformState(subform));
                }
            });
        }

        // outside realm changes
        this.resourceState.integrator.cardAssemblyPlugin.viewModel.onNodeConsumerRelationsChange$.subscribe((nodeOwnedRouteRelationList) => {
            this._cdr.detectChanges();
        });
    }

    // deliver message sate wh
    private deliverSubformState(subform: FormGroup) {
        const msg = this.resourceState.message;
        const rr = this.resourceState.integrator.simulatorProducerFormView.findRouteRelationByMessage(msg);
        if (rr && rr.connectors.size) {
            this.resourceState.integrator.onAnimateSubmitSocketConnectorRelationList(rr, msg, this.resourceState.integrator.simulatorProducerFormView.findStateTypeControl(subform, msg)!.value);
            this.resourceState.integrator.simulatorProducerFormView.submitSubform(subform, rr, msg, this.resourceState.nodeModel);
        }
    }


    // private subform not related to model. will simulate some aspects of form automation
    private createEmitterSubform() {

        this.emitterForm = this.fb.group({
            active: [resources.emitter.form.active, []],
            interval: [resources.emitter.form.interval, []],
            strategyType: [resources.emitter.form.strategyType, []]
        });

        // toggle emitter
        this.emitterForm.get("active")!.valueChanges.pipe(distinctUntilChanged()).subscribe((enabled) => {
            if (enabled) {
                this.createEmitterEngine();
                this.emitterEngineStart$.next();
            } else {
                this.emitterEngineStop$.next();
            }
        });

        this.periodicEmitterIntervalChange$ = this.emitterForm.get("interval")!.valueChanges.pipe(distinctUntilChanged());
    }

    private createEmitterEngine() {

        // adjustable periodic emitter
        this.periodicEmitter$ = merge(this.emitterEngineStart$, this.periodicEmitterIntervalChange$).pipe(
            switchMap(() => interval(this.emitterForm.get("interval")!.value)),
            takeUntil(this.emitterEngineStop$)
        );

        this.periodicEmitter$.subscribe(res => this.applyEmitterControlPhase());

    }

    // at this particular time instance, drive by a clock apply some emitter logic
    private applyEmitterControlPhase() {
        const subform = this.resourceState.integrator.simulatorProducerFormView.messagesForm.get(this.resourceState.message.form.component);

        const getRandom = (min: number, max: number) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        if (subform) {
            switch (this.emitterForm.get("strategyType")!.value) {

                // pick some random colors
                case EmitterPatternType.randomized:
                    resources.fields.forEach((field) => {
                        const control = subform.get(field)!;
                        control.setValue(getRandom(resources.ranges.minimum, resources.ranges.maximum));
                    });
                    this.periodicEmitterCycleCount++;
                    break;

                case EmitterPatternType.brighten:
                    // not yet implemented
                    break;

                case EmitterPatternType.darken:
                    // not yet implemented
                    break;

                default:

            }
        }

        this._cdr.markForCheck(); // notifies UI compositor of changes
    }

}

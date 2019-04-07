import { ChangeDetectionStrategy, Component, OnChanges, OnDestroy, OnInit } from "@angular/core";

import { combineLatest, Observable, of } from "rxjs";
import { distinctUntilChanged, pairwise } from "rxjs/operators";
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators
} from "@angular/forms";
import {
    SocketConnectorType,
    SocketModel,
    SocketViewModel
} from "../../../../studio/nodeflow-studio-compositor/state/model/socket.model";
import { ToolbarAddNodeflowAgentService } from "./toolbar-add-nodeflow-agent.service";
import { ViewAssemblyTypeStateResourceLayoutItemSchema } from "ngx-card-deck";
import { NodeModel } from "../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { SocketConnectorRelationStateType } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import { ToolbarNodeflowActionBase } from "../toolbar-nodeflow-action-base";
import { NodeflowStudioCompositorComponent } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-compositor.component";
import { NodeflowCardProjectPackageSchema } from "../../../client/organizers/nodeflow/metadata/schema/nodeflow-card-project.interface";
import { BusinessNodeflowCardProviderSchema } from "../../../client/organizers/nodeflow/lib/models/parsers/dashboard/provider/business-nodeflow-card-provider.interface";
import { CardCatalogResourcesPackage } from "../../../client/organizers/nodeflow/metadata/schema/card-catalog-resources.interface";
import { AssetTypeConfigurationSchema } from "../../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.model";
import { SocketRelationFormModel } from "./toolbar-add-nodeflow.interface";
import * as assetTypeList from "./data/asset-type-list.json";
// for demonstration point to sample lists of model templates
import * as project1ProjectJson from "../../../client/organizers/nodeflow/metadata/projects/project1/project.json";
import * as project1CatalogJson from "../../../client/organizers/nodeflow/metadata/projects/project1/catalog.json";

const resources = {

    action: {
        newCardName: {
            prefix: "new-node-card"
        }
    },
    form: {
        newCardName: {default: "sample card"},
        assetType: {default: null}, // asset type id

        // list of several socket relations
        relation: {
            initialSetCount: 1,

            // exact match `SocketRelationFormModel`
            model: {
                socket: {default: null},
                message: {default: null},
                isMessageStateSynchronized: {default: true}, // auto sync message data state
                isSocketLinked: {default: true},
                isSocketMulticast: {default: false},
                linkStateType: {default: SocketConnectorRelationStateType.valid}, // new socket connector relation link assumes a state
            }
            // isMessageLinked: {default: true},
        },

        isVerboseMode: {default: false}
    },

    types: {
        assetTypeList: assetTypeList.default as any as Array<AssetTypeConfigurationSchema>,
    },
    configuration: {
        projects: {/* project metadata-templates stored */},
        catalogs: {/* catalog of deck resources */}
    }
};

@Component({
    selector: 'nodeflow-toolbar-add-nodeflow',
    templateUrl: './toolbar-add-nodeflow.html',
    styleUrls: ['./toolbar-add-nodeflow.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarAddNodeflowComponent extends ToolbarNodeflowActionBase implements OnInit, OnDestroy, OnChanges {

    availableAssetTypeList: Array<AssetTypeConfigurationSchema> = resources.types.assetTypeList;

    // set of project compatible message templates, known catalogs
    catalogResourcesCollectionCache$: Observable<Array<CardCatalogResourcesPackage>>;
    projectResourcesCollectionCache$: Observable<Array<NodeflowCardProjectPackageSchema>>;
    private cardIdentifier = 1; // simple beginnings

    constructor(private fb: FormBuilder,
                private nodeflowAgentService: ToolbarAddNodeflowAgentService,
                protected gridStateManagerService: NodeflowStudioGridStateManagerService) {
        super(gridStateManagerService);

    }

    // non-empty set of determinate remote output sockets that feed into this new node's input
    get selectedRemoteProducerSocketList(): Array<SocketModel> {
        return this.getSocketRelationFormArray(SocketConnectorType.input).controls
            .map((socketRelationFormGroup) => socketRelationFormGroup.get("socket")!.value as SocketModel)
            .filter((socket) => !!socket);
    }

    // non-empty set of determinate remote input sockets that receive messages from this new node's output
    get selectedRemoteConsumerSocketList(): Array<SocketModel> {
        return this.getSocketRelationFormArray(SocketConnectorType.output).controls
            .map((socketRelationFormGroup) => socketRelationFormGroup.get("socket")!.value as SocketModel)
            .filter((socket) => !!socket);
    }


    // written as closure, validation rule: prevent same node being used between an input and output socket
    isNodeCircularReferenceConnectorRule: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {

        // collection of socket relation subform
        // set of just consumer and producer nodes involved
        if (this.gridStateManagerService.isInitialized$.getValue()) {

            const [remoteProducerNodeList, remoteConsumerNodeList] = [this.selectedRemoteProducerSocketList, this.selectedRemoteConsumerSocketList]
                .map((list) =>
                    list.map((socket) => this.gridStateManagerService.findNodeBySocket(socket))
                        .filter((node, idx, arr) => arr.indexOf(node) === idx));

            const errors = remoteProducerNodeList.reduce((accumulator, producerNode) => (accumulator + (+(remoteConsumerNodeList.indexOf(producerNode) >= 0))), 0);

            return !errors ? null : {"circular_reference_connector": {label: "Circular reference using same node"}};

        } else {
            return null;
        }

    };

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
    }

    // ======================= Nodeflow User Interactions ===================
    onAddNodeAssetEvent() {
        const newCardResourceId = [resources.action.newCardName.prefix, this.cardIdentifier++].join("-");
        const newCardName = this.toolbarNodeflowBehaviorActionForm.get("newCardName")!.value;

        const cardX = this.cardIdentifier; // presumed start and will try to "wrap" around other cards on deck
        const cardY = 0;
        const cardWidth = 1;
        const cardHeight = 1;

        const gca = this.resolvedNodeflow.pageComponent.gridContainerAssemblyInstance;
        const newCardBusinessProvider: BusinessNodeflowCardProviderSchema = {
            assetTypeId: this.toolbarNodeflowBehaviorActionForm.get("assetType")!.value,
            catalogId: "testCatalogId-" + Date.now(),
            layoutId: "testLayoutId-" + Date.now()
        };

        this.nodeflowAgentService.addNodeflow$(newCardResourceId,
            newCardName, cardX, cardY, cardWidth, cardHeight,
            newCardBusinessProvider,
            this.getSocketRelationFormArrayValue(SocketConnectorType.input),
            this.getSocketRelationFormArrayValue(SocketConnectorType.output),
            this.resolvedNodeflow,
            gca,
            this.resolvedNodeflow.updateViewTransition.bind(this.resolvedNodeflow),
            this.resolvedNodeflow.pageComponent.layoutItemInitialize$
        ).subscribe(
            (nodeModel) => {
                this.processingErrorMessage = undefined;
                // react to container
                // notify invoking component UI for capturing new item addition
                this.resolvedNodeflow.pageComponent.onGridLayoutItemAdd(nodeModel.view.gridItem.item as ViewAssemblyTypeStateResourceLayoutItemSchema);
            },
            (bad) => {
                this.processingErrorMessage = bad; // propagate processing error strings
                // console.error("could not add relation", bad);
            },
            () => {
                // when item has been added to the UI view
                this.resetForm();

            });

    }

    // clicking the (+) button facilitates multiple socket relations
    onAddSocketRelationDetail(type: SocketConnectorType) {
        this.getSocketRelationFormArray(type).push(this.factorySocketMessageRelationFormGroup());
    }

    // clicking the (+) button facilitates multiple socket relations
    onRemoveSocketRelationDetail(type: SocketConnectorType, position: number) {

        // turn off highlight
        const selectedSocket = this.getSocketRelationFormArray(type).controls[position].get("socket")!.value;
        if (selectedSocket) {
            this.resolvedNodeflow.onSocketViewSelectingStateChangeEvent(selectedSocket, false);
        }

        this.getSocketRelationFormArray(type).removeAt(position);
    }

    // validation: derive useful warning message
    adviseSocketCapabilityValidationErrors(nodeModel: NodeModel, socket: SocketModel, socketRelation: SocketRelationFormModel): Set<{ code: string, label: string }> {
        return this.nodeflowAgentService.generateValidationErrors(nodeModel, socket, socketRelation);
    }


    // user desired set of sockets to add either as consumer or producer
    // requires: Message Model ( input: pull from mock catalog, output: reference)

    // validation: check if any error would result if assigning this socket to the new nodeflow
    checkSocketCapabilityValidationErrors(nodeModel: NodeModel, socket: SocketModel, socketRelation: SocketRelationFormModel): boolean {
        return this.adviseSocketCapabilityValidationErrors(nodeModel, socket, socketRelation).size > 0;
    }

    // depending on whether or not the option group has potential children, show or hide the group header item
    showSelectListOptionGroup(nodeModel: NodeModel, opposingSocketDirectionType: SocketConnectorType, socketRelationFormGroup: FormGroup): boolean {
        if (nodeModel.link) {
            const candidateSockets = nodeModel.link.getCollectionByType(opposingSocketDirectionType);
            const candidateSocketsCount = candidateSockets.size;

            // default mode
            if (!this.selectedIsVerboseMode) {

                if (candidateSocketsCount > 0) {
                    const errorCount = Array.from(candidateSockets)
                        .reduce((accumulator2, socket) => (accumulator2 + (+this.checkSocketCapabilityValidationErrors(nodeModel, socket, this.factorySocketRelationFormModel(socketRelationFormGroup)))), 0);

                    return candidateSocketsCount !== errorCount;

                } else {
                    return candidateSocketsCount > 0;
                }

                // show all errors as disabled items
            } else {

                return candidateSocketsCount > 0;
            }
        } else {
            return false; // missing possibility of having linking sockets
        }

    }

    // rule: topic must be unique within a node, so prevent it from being selected in the list
    checkSocketRelationFormArrayUniqueTopicRule(assigningSocketRelationFormGroup: FormGroup, subformIndex: number): boolean {

        // this.getSocketRelationFormArray(type).push(this.factorySocketMessageRelationFormGroup());
        //console.log(assigningSocketRelationFormGroup, subformIndex );
        const socketRef = assigningSocketRelationFormGroup.get("socket")!.value;

        return true;
    }

    // requires: existing socket model ( via node reference )
    getSocketRelationFormArray(socketType: SocketConnectorType): FormArray {
        return this.toolbarNodeflowBehaviorActionForm.get(socketType === SocketConnectorType.input ? "consumers" : "producers") as FormArray;
    }

    // get an array of serialized, immutable records for all of the socket relations
    getSocketRelationFormArrayValue(socketType: SocketConnectorType): Array<SocketRelationFormModel> {
        return this.getSocketRelationFormArray(socketType).controls
            .map((control) => this.factorySocketRelationFormModel(control as FormGroup));
    }

    // serialized structure that is decouple from Angular form - must avoid passing form dependencies into service layer
    factorySocketRelationFormModel(socketFormRelationControl: FormGroup): SocketRelationFormModel {
        const obj = {} as any as SocketRelationFormModel;
        // exact match `SocketRelationFormModel`
        Object.keys(resources.form.relation.model).forEach((k) => obj[k] = socketFormRelationControl.get(k)!.value);

        return obj;
    }

    // clear out registries for relation(s) in the form array
    resetSocketRelationFormArray(socketType: SocketConnectorType): number {
        let i = 0;

        const relationFormArray = this.getSocketRelationFormArray(socketType);
        while (relationFormArray.length !== 0) {
            relationFormArray.removeAt(0);
            i++;
        }

        for (let initialCount = 0; initialCount < resources.form.relation.initialSetCount; initialCount++) {
            relationFormArray.push(this.factorySocketMessageRelationFormGroup());
        }


        return i;
    }

    // event hook propagation to dependent initializers
    onResolveNodeflowComponent(cmp: NodeflowStudioCompositorComponent) {
        this.setupModelTemplates();
    }

    debug(d: any) {
        console.log("debug inspect", d);
    }

    protected createForm() {
        // add a new card
        const form = this.fb.group({
                newCardName: [resources.form.newCardName.default, [Validators.required]],

                // preset to any asset type
                // tslint:disable-next-line:no-bitwise
                assetType: [this.availableAssetTypeList[Math.random() * this.availableAssetTypeList.length >> 0].assetTypeId, [Validators.required]],

                // collection of consumers
                consumers: this.fb.array([]),
                producers: this.fb.array([]),

                isVerboseMode: [resources.form.isVerboseMode.default, []]
            },
            {validator: Validators.compose([this.isNodeCircularReferenceConnectorRule])}
        );

        // seed with a few initial consumer/producer bindings
        for (let c = 0; c < resources.form.relation.initialSetCount; c++) {
            (form.get("consumers") as FormArray).push(this.factoryConsumerRelationFormGroup());
            (form.get("producers") as FormArray).push(this.factoryProducerRelationFormGroup());
        }


        this.toolbarForm.addControl("newCard", form);

        return form;
    }

    protected resetForm() {


        this.toolbarNodeflowBehaviorActionForm.reset();

        // preset to any asset type
        // tslint:disable-next-line:no-bitwise
        this.toolbarNodeflowBehaviorActionForm.get("assetType")!.reset(this.availableAssetTypeList[Math.random() * this.availableAssetTypeList.length >> 0].assetTypeId);

        // can only occur after view updates, reset subform state
        [this.selectedRemoteProducerSocketList, this.selectedRemoteConsumerSocketList]
            .forEach((directedSocketList) => directedSocketList.forEach((socketRef) => this.resolvedNodeflow.onSocketViewSelectingStateChangeEvent(socketRef, false)));

        // recently added relations cleared
        SocketViewModel.supportedConnectorTypes.forEach((type) => this.resetSocketRelationFormArray(type));
    }

    private factoryConsumerRelationFormGroup(): FormGroup {
        return this.factorySocketMessageRelationFormGroup();
    }

    private factoryProducerRelationFormGroup(): FormGroup {
        return this.factorySocketMessageRelationFormGroup();
    }

    private factorySocketMessageRelationFormGroup(): FormGroup {

        const fg = this.fb.group({
            socket: [resources.form.relation.model.socket.default, []],
            message: [resources.form.relation.model.message.default, []],
            isMessageStateSynchronized: [resources.form.relation.model.isMessageStateSynchronized.default, []],
            isSocketLinked: [resources.form.relation.model.isSocketLinked.default, []],
            isSocketMulticast: [resources.form.relation.model.isSocketMulticast.default, []],
            linkStateType: [resources.form.relation.model.linkStateType.default, []],
        });

        this.prepareSocketControlVisualHighlighting(fg.get("socket")! as FormControl);
        this.prepareSocketSynchronizeMessageControl(fg.get("socket")! as FormControl, fg.get("message")! as FormControl);

        return fg;
    }

    // on change of socket, attempt to pick the best matching message
    private prepareSocketSynchronizeMessageControl(socketControl: FormControl, messageControl: FormControl) {
        socketControl.valueChanges.pipe(distinctUntilChanged(), pairwise())
            .subscribe((socketSelectionPair: Array<SocketModel | null>) => {
                socketSelectionPair.forEach((socket, idx) => {
                    if (socket && idx === 1) {


                        if (this.currentProjectDashboardConfiguration) {
                            // todo: preset equivalent message
                        }

                    }
                });
            });
        socketControl.setValue(socketControl.value);
    }

    // toggle remote node's related socket visually
    private prepareSocketControlVisualHighlighting(socketControl: FormControl) {

        // auto highlights socket upon selecting from list

        // auto highlights socket upon selecting from list
//        for (const socketSelectionControl of p[]) {
        // set highlight on intended socket as confirmation of action
        socketControl.valueChanges.pipe(distinctUntilChanged(), pairwise())
            .subscribe((socketSelectionPair: Array<SocketModel | null>) => {
                socketSelectionPair.forEach((socket, idx) => {
                    if (socket) {
                        this.resolvedNodeflow.onSocketViewSelectingStateChangeEvent(socket, idx === 1);
                    }
                });
            });
        socketControl.setValue(socketControl.value);
        // }
    }

    // simulate loading necessary configuration from server
    private populateResourceConfiguration() {
        // emulated imported catalog assignment
        resources.configuration.catalogs[(project1CatalogJson.default as any as CardCatalogResourcesPackage).id] =
            project1CatalogJson.default as any as NodeflowCardProjectPackageSchema;

        // emulated imported project assignment
        resources.configuration.projects[(project1ProjectJson.default as any as NodeflowCardProjectPackageSchema).project.item.id] =
            project1ProjectJson.default as any as NodeflowCardProjectPackageSchema;

        // presume async loader
        // content maanage emulation -- which resources are under control of a catalog
        this.catalogResourcesCollectionCache$ = combineLatest(
            Object.keys(resources.configuration.catalogs).map((catalogId) => of(resources.configuration.catalogs[catalogId]))
        );
        // presume async loader
        // this.projectMessageCollectionCache$ = combineLatest(
        //     Object.keys(resources.configuration.catalogs).map((catalogId) => of(resources.configuration.catalogs[catalogId]))
        // );

        this.projectResourcesCollectionCache$ = combineLatest(
            Object.keys(resources.configuration.projects).map((projectId) => of(resources.configuration.projects[projectId]))
        );


        // projectResourcesCollectionCache$: Observable<Array<NodeflowCardProjectPackageSchema>>;
    }

    // form
    /*
    private getSelectedSocketModelListBySocketConnectorType(socketType: SocketConnectorType, form: FormGroup): Array<SocketModel> {
        const directedSocketRelationFormGroup = form.get(socketType === SocketConnectorType.input ? "consumers" : "producers") as FormArray;

        return directedSocketRelationFormGroup.controls
            .map((socketRelationFormGroup) => socketRelationFormGroup.get("socket")!.value as SocketModel)
            .filter((socket) => !!socket);

    }
    */

    private setupModelTemplates() {


        if (!this.currentProjectDashboardConfiguration) {
            console.error("could not reference current project configuration resources");
            return;
        }

        this.populateResourceConfiguration();
    }
}

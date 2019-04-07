import {
    DashboardConfigurationFacadeService,
    DashboardConfigurationResourceCardSchema,
    ViewAssemblyTypeStateResourceLayoutItemSchema
} from "ngx-card-deck";
import { Injectable } from "@angular/core";
import { NodeflowConfigurationPreprocessor } from "../../../client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.class";
import { GridContainerDashboardContainerComponent } from "ngx-card-deck";
import { GridContainerDashboardAssemblyMaterializedModel } from "ngx-card-deck";
import { Observable, Subject } from "rxjs";
import { map, take, tap } from "rxjs/operators";
import { NodeModel } from "../../../../studio/nodeflow-studio-compositor/state/model/node.model";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import { GridsterItemComponentInterface } from "ngx-card-deck";
import { NodeflowAssetNodeComponent } from "../../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.component";
import { NodeflowCompositorViewUpdatable } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio.interface";


// joins model and gridster UI item
interface MaterializedModelViewRelation {
    model: GridContainerDashboardAssemblyMaterializedModel<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>;
    item: GridsterItemComponentInterface;
}

const resources = {};


@Injectable()
export class ToolbarRemoveNodeflowAgentService {

    private cardConfigurationPreprocessor: NodeflowConfigurationPreprocessor;

    constructor(private gridStateManager: NodeflowStudioGridStateManagerService,
                private configurationFacadeService: DashboardConfigurationFacadeService) {
        this.cardConfigurationPreprocessor = new NodeflowConfigurationPreprocessor();

    }


    removeNodeflow$(
        removePlugin: NodeflowAssetNodeComponent<any, any, any, any>,
        nodeflowCompositorView: NodeflowCompositorViewUpdatable,
        gridContainerAssemblyInstance: GridContainerDashboardContainerComponent,
        updateViewTrigger: () => void,
        deletedGridItemDestroy$: Observable<ViewAssemblyTypeStateResourceLayoutItemSchema>
    ): Observable<NodeModel> {
        const nodeModel = removePlugin.viewModel.nodeModel;

        return this.startRemovalProcess$(removePlugin, gridContainerAssemblyInstance, deletedGridItemDestroy$)
            .pipe(
                map((modelView) => {
                    this.removeRouteRelationConnectors(nodeModel);
                    this.gridStateManager.removeNode(nodeModel);

                    return nodeModel;
                }),
                tap(() => {
                    updateViewTrigger(); // side effect to update canvas view
                }),
                take(1)
            );
    }


    private startRemovalProcess$(
        removePlugin: NodeflowAssetNodeComponent<any, any, any, any>,
        gridContainerAssemblyInstance: GridContainerDashboardContainerComponent,
        removeGridItemDestroy$: Observable<ViewAssemblyTypeStateResourceLayoutItemSchema>
    ): Observable<MaterializedModelViewRelation> {

        const modelView$ = new Subject<MaterializedModelViewRelation>();
        const materializedModel = gridContainerAssemblyInstance.assemblyState.findModelByResourceFacade(removePlugin.resourceToken.card);

        if (materializedModel) {
            const affected = gridContainerAssemblyInstance.assemblyState.removeModel(materializedModel);
            const nodeModel = removePlugin.viewModel.nodeModel;

            if (affected) {
                gridContainerAssemblyInstance.gridWidget.optionsChanged();

                // short-lived and completes as the outer stream persists
                removeGridItemDestroy$.pipe(take(1)).subscribe((x) => {
                    modelView$.next({
                        model: materializedModel,
                        item: nodeModel.view.gridItem
                    });
                });

            } else {
                console.error("could not remove materialized model from assemblyState at index", materializedModel);
            }

        } else {
            console.log('remove: unable to reference materialized model', removePlugin.resourceToken.card.resourceId);
        }

        return modelView$;
    }


    // dependencies removal
    // destroy all relations having connection to the nodeModel about to be destroyed
    private removeRouteRelationConnectors(nodeModel: NodeModel) {
        const nodeLink = nodeModel.link;

        if (nodeLink) {

            [nodeLink.producerSocketCollection, nodeLink.consumerSocketCollection].forEach((socketCollection) => {

                socketCollection.forEach((directedSocket) => {

                    // critical verification of associated relations between the reference node socket and foreign nodes
                    // only finds route relations having an established connection. permission to use `getRouteRelationListBySocket(directedSocket()`
                    const producerMessageConnectorsRouteRelationModelList = this.gridStateManager.routes.getRouteRelationListBySocket(directedSocket);

                    producerMessageConnectorsRouteRelationModelList.forEach((routeRelationModel) => {
                        // affected relations
                        const dependencySocketConnectorRelationList = routeRelationModel.getSocketConnectorRelationListByNode(nodeModel, directedSocket.type);

                        dependencySocketConnectorRelationList.forEach((scr) => {

                            const removedFlag = routeRelationModel.removeConnector(scr);
                            if (!removedFlag) {
                                console.error("unable to delete relation", scr, "on node", nodeModel);
                            }

                        });
                    });
                });
            });

        }

    }

}


import { Injectable } from "@angular/core";
import { NodeflowConfigurationPreprocessor } from "../../../client/organizers/nodeflow/lib/models/parsers/dashboard/integration/nodeflow-configuration-preprocessor.class";
import { NodeflowStudioGridStateManagerService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-grid-state-manager.service";
import { NodeflowStudioConnectorLoaderService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-connector-loader.service";
import { NodeflowStudioConnectorGeometryService } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio-connector-geometry.service";
import { SocketConnectorRelationModel } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/socket-connector-relation.model";
import { DashboardConfigurationFacadeService } from "ngx-card-deck";
import { GridContainerDashboardContainerComponent } from "ngx-card-deck";
import { Observable, of, throwError } from "rxjs";
import { tap } from "rxjs/operators";
import { MessageConnectorsRouteRelationModel } from "../../../../studio/nodeflow-studio-compositor/state/model/relation/message-connectors-route-relation.model";
import { NodeflowCompositorViewUpdatable } from "../../../../studio/nodeflow-studio-compositor/nodeflow-studio.interface";


const resources = {};

@Injectable()
export class ToolbarRemoveSocketConnectorRelationAgentService {

    private cardConfigurationPreprocessor: NodeflowConfigurationPreprocessor;

    constructor(private gridStateManager: NodeflowStudioGridStateManagerService,
                private configurationFacadeService: DashboardConfigurationFacadeService,
                private connectorGeometryService: NodeflowStudioConnectorGeometryService,
                private connectorLoaderService: NodeflowStudioConnectorLoaderService) {
        this.cardConfigurationPreprocessor = new NodeflowConfigurationPreprocessor();

    }

    removeSocketConnectorRelation$(
        removeSocketConnectorRelation: SocketConnectorRelationModel,
        removeEmptyRouteRelationFlag: boolean,
        nodeflowCompositorView: NodeflowCompositorViewUpdatable,
        gridContainerAssemblyInstance: GridContainerDashboardContainerComponent,
        updateViewTrigger: () => void
    ): Observable<MessageConnectorsRouteRelationModel> {

        // place new card onto deck, assembling node and connector dependencies
        return this.startRemovalProcess$(removeSocketConnectorRelation, removeEmptyRouteRelationFlag, gridContainerAssemblyInstance).pipe(
            tap((socketConnectorRelation) => {

                // side effect to update canvas view
                updateViewTrigger();
            })
        );

    }

    // mutation to model store for route relation holding the socket connector relation
    private startRemovalProcess$(targetSocketConnectorRelation: SocketConnectorRelationModel, removeEmptyRouteRelationFlag: boolean, gridContainerAssemblyInstance: GridContainerDashboardContainerComponent): Observable<MessageConnectorsRouteRelationModel> {

        const routeRelation = this.gridStateManager.routes.findRouteRelationBySocketConnectorRelation(targetSocketConnectorRelation);

        if (routeRelation) {
            const removedFlag = routeRelation.removeConnector(targetSocketConnectorRelation);

            if (removedFlag) {

                // rule: physically removed unreferenced route relation when no more items
                if (removeEmptyRouteRelationFlag && routeRelation.connectors.size === 0) {
                    this.gridStateManager.routes.removeRouteRelation(routeRelation);
                }

                return of(routeRelation);
            } else {
                return throwError(new Error("Could not remove item from message connector route relation collection"));
            }
        } else {
            return throwError(new Error("Unresolved message connector route relation for connector"));
        }

    }

}


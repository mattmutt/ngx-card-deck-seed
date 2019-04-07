import { ComponentFactoryResolver, forwardRef, Inject, Injectable, Injector } from "@angular/core";
import { StandardCardPluginServiceBase } from "../../../../../common/standard/card-outlet/card-assembly-plugins/base/standard-card-plugin-service-base";
import { Observable, of } from "rxjs";
import { NodeflowAssetNodeDataRecordEntitySchema } from "./nodeflow-asset-node.interface";
import { NodeflowAssetNodeDataModel } from "./nodeflow-asset-node.model";
import { CARD_OUTLET_COMPONENTS_CONFIG_TOKEN } from "ngx-card-deck";
import { CardOutletExtensionViewRender } from "ngx-card-deck";
import { TemplateTransporterService } from "ngx-card-deck";


@Injectable()
export class NodeflowAssetNodeService<T extends NodeflowAssetNodeDataModel> extends StandardCardPluginServiceBase<T> {

    constructor(@Inject(forwardRef(() => CARD_OUTLET_COMPONENTS_CONFIG_TOKEN))
                protected staticConfigurationList: Array<CardOutletExtensionViewRender<any>>,
                protected _templateTransporter: TemplateTransporterService,
                protected compResolver: ComponentFactoryResolver,
                protected _injector: Injector) {
        super(_injector);
        super.initialize();
    }


    getSummaryData$(resourceId: string): Observable<T> {
        const data: NodeflowAssetNodeDataRecordEntitySchema = {name: "testing"};
        const model: NodeflowAssetNodeDataModel = {response: {entity: data}};
        // export class AssetNodeComponent<T extends NodeflowAssetNodeDataModel,
        return of(<T> (model as any));
    }


    /*
    // network service fetch and data assembly
    streamInitialDataModel(dcrf: DashboardConfigurationResourceFacade<DashboardConfigurationResourceCardSchema, DashboardConfigurationResourceCardSchema>,
                           dashboardFacade: DashboardComponent): Observable<DashboardGridDataReaderResponseDeliverable<T>> {

      const dals = dcrf.resolver.injectorInstance.state() as DashboardAssemblyLayoutState;
      const serviceResourceFacade = dals.findConfigurationResourceByType("modulesList", "service")!;

      const o$ = this._templateTransporter.awaitingResourceStream(serviceResourceFacade).pipe(
        map((d: boolean) => {
          const entity: AssetNodeDataRecordEntitySchema = serviceResourceFacade.resolver.getSnapshotData();
          return {response: {entity: entity}};
        }),
        share());

      return o$;
    }
    */


    /*
    // preferred screen shot size
    getBitmap$(resourceId: string, width: number, height: number): Observable<any> {
        return this.apiService.getProperty$(resourceId, ["screenshot"], {
            propertyParams: [{
                propertyName: "bitmap",
                parameterType: "paramtype",
                parameter: {
                    width: width,
                    height: height
                }
            }]
        });
    }
    */

}


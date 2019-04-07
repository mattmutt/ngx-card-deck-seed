import { NgModule, Type } from '@angular/core';
import { ClrDatagridModule } from "@clr/angular";
import { demoModuleRouteMap } from "../../../demo-dashboard-routing.module";
import { MetricsBillboardComponent } from '../../client/core/com.company.group/views/card-assembly-plugins/metrics-billboard/metrics-billboard.component';
import { MetricsBillboardService } from '../../client/core/com.company.group/views/card-assembly-plugins/metrics-billboard/metrics-billboard.service';
import { SummaryBillboardComponent } from '../../client/core/com.company.group/views/card-assembly-plugins/summary-billboard/summary-billboard.component';
import { SummaryBillboardService } from '../../client/core/com.company.group/views/card-assembly-plugins/summary-billboard/summary-billboard.service';

import { DemoDashboardCardOutletExtensionViewRender } from './demo-dashboard-card-outlet-render-definitions.interface';
import { DemoDashboardOrganizerPackageEnumeration } from './demo-dashboard-organizer-package.class';
import { demoDashboardVendorClassificationMap } from "./demo-dashboard-vendor-classification.class";
import { DemoClientMetricsBillboardTemplateComponent } from "../../client/common/com.company.sample1/views/card-templates/components/demo-client-metrics-billboard/demo-client-metrics-billboard-template.component";
import { DemoClientSummaryBillboardTemplateComponent } from "../../client/common/com.company.sample1/views/card-templates/components/demo-client-summary-billboard/demo-client-summary-billboard-template.component";
import { NodeflowAssetNodeTemplateComponent } from "../../client/organizers/nodeflow/views/card-templates/nodeflow-asset-node/nodeflow-asset-node-template.component";
import { NodeflowAssetNodeParserService } from "../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node-parser.service";
import { NodeflowAssetNodeService } from "../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.service";
import { MetricsParserService } from "../../client/common/com.company.sample1/views/card-assembly-plugins/metrics-billboard/metrics-parser.service";
import { NodeflowAssetNodeComponent } from "../../client/organizers/nodeflow/views/card-assembly-plugins/asset-node/nodeflow-asset-node.component";
import { SummaryParserService } from "../../client/common/com.company.sample1/views/card-assembly-plugins/summary-billboard/summary-parser.service";
import { ComCompanySample1TemplateModule } from "../../client/common/com.company.sample1/views/card-templates/modules/com_company_sample1_template.module";
import { NodeflowProject1CardTemplatesModule } from "../../client/organizers/nodeflow/views/card-templates/nodeflow-asset-node/modules/nodeflow-project1-card-templates.module";
import {
    DashboardCardPluggable,
    ServiceRenderClass
} from "ngx-card-deck";
import { SimpleGridCardComponent } from "../../client/core/com.company.group/views/card-assembly-plugins/simple-grid-card/simple-grid-card.component";
import { SimpleGridCardService } from "../../client/core/com.company.group/views/card-assembly-plugins/simple-grid-card/simple-grid-card.service";
import { SimpleGridParserService } from "../../client/common/com.company.sample1/views/card-assembly-plugins/simple-grid-card/parser/simple-grid-parser.service";
import { InventorySummaryTransformerService } from "../../client/common/com.company.sample1/views/card-assembly-plugins/simple-grid-card/parser/inventory-summary-transformer.service";
import { InstalledPluginsDashboardTransformerService } from "../../client/common/com.company.sample1/views/card-assembly-plugins/simple-grid-card/parser/installed-plugins-dashboard-transformer.service";
import { DemoClientGridCardTemplateComponent } from "../../client/common/com.company.sample1/views/card-templates/components/demo-client-grid-card/demo-client-grid-card-template.component";

//export class AssetNodeComponent extends LayoutAssemblyCardBase<NodeflowAssetNodeDataModel> implements OnInit, AfterViewInit, AfterContentInit {


// promise contract fails with AoT due to complex expression
// -------- individual template setup :: static compilation encoding requires a function --------------

// data grid widget
export function demoClientGridCardTemplateTransport() {
    return Promise.resolve(DemoClientGridCardTemplateComponent);
}

// metrics billboard
export function demoClientMetricsBillboardTemplateTransport() {
    return Promise.resolve(DemoClientMetricsBillboardTemplateComponent);
}

// summary billboard
export function demoClientSummaryBillboardTemplateTransport() {
    return Promise.resolve(DemoClientSummaryBillboardTemplateComponent);
}

// asset node
export function nodeflowAssetNodeTemplateTransport() {
    return Promise.resolve(NodeflowAssetNodeTemplateComponent);
}


// ------------ Framework examples -----------


export const demoClientGridCardViewRenderCompartment: DemoDashboardCardOutletExtensionViewRender<any> = {
    identifier: 'card-datagrid',
    organizerPackage: DemoDashboardOrganizerPackageEnumeration.com_company_sample1,
    componentClass: SimpleGridCardComponent,
    viewProviders: [SimpleGridCardService, SimpleGridParserService, InventorySummaryTransformerService, InstalledPluginsDashboardTransformerService],

    // optional template association
    resolveTemplatableClassesList: [{
        classification: demoDashboardVendorClassificationMap['1'],
        load: demoClientGridCardTemplateTransport
    }]
};


// ------------- Business Client Business Team --------------------

// ====== Nodeflow ==========
export const nodeflowAssetNodeCardViewRenderCompartment: DemoDashboardCardOutletExtensionViewRender<any> = {
    identifier: 'card-asset-node',
    organizerPackage: DemoDashboardOrganizerPackageEnumeration.com_company_sample1,
    componentClass: NodeflowAssetNodeComponent,
    viewProviders: [NodeflowAssetNodeService, NodeflowAssetNodeParserService],

    // optional template association
    resolveTemplatableClassesList: [{
        classification: demoDashboardVendorClassificationMap.nodeflow_sample,
        load: nodeflowAssetNodeTemplateTransport,
        //loadModuleRoute: demoModuleRouteMap.demoClientMetricsBillboard // lazy module bundles DemoClientMetricsBillboardTemplateComponent
    }]
};


// ====== metrics billboard ==========
export const demoClientMetricsBillboardCardViewRenderCompartment: DemoDashboardCardOutletExtensionViewRender<any> = {
    identifier: 'card-metrics-billboard',
    organizerPackage: DemoDashboardOrganizerPackageEnumeration.com_company_sample1,
    componentClass: MetricsBillboardComponent,
    viewProviders: [MetricsBillboardService, MetricsParserService],

    // optional template association
    resolveTemplatableClassesList: [{
        classification: demoDashboardVendorClassificationMap['2'],
        load: demoClientMetricsBillboardTemplateTransport,
        loadModuleRoute: demoModuleRouteMap.demoClientMetricsBillboard // lazy module bundles DemoClientMetricsBillboardTemplateComponent
    }]
};

// ====== summary billboard ===========
export const demoClientSummaryBillboardCardViewRenderCompartment: DemoDashboardCardOutletExtensionViewRender<any> = {
    identifier: 'card-summary-billboard',
    organizerPackage: DemoDashboardOrganizerPackageEnumeration.com_company_sample1,
    componentClass: SummaryBillboardComponent,
    viewProviders: [SummaryBillboardService, SummaryParserService],

    // optional template association
    resolveTemplatableClassesList: [{
        classification: demoDashboardVendorClassificationMap['2'],
        load: demoClientSummaryBillboardTemplateTransport
    }]
};

// -------------------------------------------------------------
// +++++++++++++++ sample extensions ++++++++++++++++++++++++++
// -------------------------------------------------------------


// arranged set of definitions
export const demoDashboardAllocatedCardOutletExtensionViewRenderDefinitionsList: Array<DemoDashboardCardOutletExtensionViewRender<any>> = [
    demoClientGridCardViewRenderCompartment,
    nodeflowAssetNodeCardViewRenderCompartment,
    demoClientMetricsBillboardCardViewRenderCompartment, // resource metrics at top
    demoClientSummaryBillboardCardViewRenderCompartment // now for summary of inventory
];


// Specialization modules hosted at CardOutletModule level. Shall be exposed to all `componentClass` instances
// AoT requirement - provide unique set of Modules
export function demoGetAllocatedModulesList(): Array<Type<NgModule>> {

    return [
        ClrDatagridModule, // SimpleGrid
        ComCompanySample1TemplateModule, // eagerly instantiated template collection samples components and services
        NodeflowProject1CardTemplatesModule // Nodeflow project
    ];

}

// AoT requirement - determine custom components linked in for view renderer
export function demoGetAllocatedComponentsList(): Array<Type<DashboardCardPluggable<any>>> {
    return [
        demoClientGridCardViewRenderCompartment.componentClass,
        nodeflowAssetNodeCardViewRenderCompartment.componentClass,
        demoClientMetricsBillboardCardViewRenderCompartment.componentClass,
        demoClientSummaryBillboardCardViewRenderCompartment.componentClass
    ];
}

// AoT requirement - determine custom components linked in for service renderer
export function demoGetAllocatedServicesList(): Array<ServiceRenderClass<any>> {
    // fix later as multiple services are added
    return [
        ...demoClientGridCardViewRenderCompartment.viewProviders,
        ...nodeflowAssetNodeCardViewRenderCompartment.viewProviders,
        ...demoClientMetricsBillboardCardViewRenderCompartment.viewProviders,
        ...demoClientSummaryBillboardCardViewRenderCompartment.viewProviders
    ];
}

// AoT requirement - determine custom components linked in for service renderer
export function demoGetAllocatedDirectivesList(): Array<Type<any>> {
    // fix later as multiple services are added
    return [
        // ...demoClientMetricsBillboardCardViewRenderCompartment.directives!
    ];
}


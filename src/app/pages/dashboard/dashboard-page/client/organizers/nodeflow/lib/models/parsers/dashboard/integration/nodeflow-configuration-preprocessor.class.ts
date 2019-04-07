import {
    AssetNodeConfigurationCardSchema,
    AssetNodeConfigurationSchema
} from "./nodeflow-configuration-preprocessor.interface";
import { ConfigurationStructureTransformable } from "ngx-card-deck";
import {
    DashboardAssemblyGridContainerLayoutItemSchema,
    DashboardAssemblyGridContainerSchema,
    DashboardConfigurationResourceSchema,
    DashboardConfigurationResourcesResources,
    DashboardConfigurationSchema,
    ExtensibilityFrameworkConsumer,
    NoOperationResolver,
    ResourceFacade,
    ResourceModuleSchema
} from "ngx-card-deck";

/**
 * An optional metadata transformer that can act upon a data structure
 *

 {
    "id": "matt-project-design-studio-20180404",

    "cards": [
            {
            "id": "temperature-monitor",
            "component": "card-asset-node",
            "templates": [
                {
                    "body": {
                        "organization": "nodeflow_sample",
                        "template": "nodePresentation"
                    }
                }
            ],
            "header": {
                "title": "Thermal Hotspot"
            },
            "layout": {
                "x": 3,
                "y": 4,
                "width": 2,
                "height": 3
            },
            "metadata": {
                "provider": {
                    "business": {
                        "assetTypeId": "19",
                        "catalogId": "catalogId-temperature-monitor",
                        "layoutId": "layoutId-temperature-monitor"
                    }
                },
                "model": {
                    "producer": null,
                    "link": {
                        "sockets": [
                            {
                                "id": "temperature-monitor-TEMP-input",
                                "type": "input",
                                "topic": "temperature",
                                "enabled": true,
                                "multicast": false
                            },
                            {
                                "id": "temperature-monitor-TEMP-capacity",
                                "type": "input",
                                "topic": "capacity",
                                "enabled": true,
                                "multicast": false
                            },
                            {
                                "id": "temperature-monitor-TEMP-name",
                                "type": "input",
                                "topic": "name",
                                "enabled": true,
                                "multicast": false
                            }
                        ]
                    }
                }
            }
        }
    ]
 }
 */
export class NodeflowConfigurationPreprocessor implements ConfigurationStructureTransformable {

    constructor() {

    }

    transform(inputStructure: AssetNodeConfigurationSchema): DashboardConfigurationSchema {

        const result: DashboardConfigurationSchema = {} as any;

        result.id = inputStructure.id;
        result.resources = {} as DashboardConfigurationResourcesResources;

        const i18nModuleResource: ResourceFacade<ResourceModuleSchema, ResourceModuleSchema> = {} as any;
        i18nModuleResource.resourceId = `${inputStructure.id}:i18n`;
        i18nModuleResource.type = "i18n";

        i18nModuleResource.resolver = {
            injector: "dashboard-assembly-translation",
            node: {
                data: {title: null}
            }
        } as any;

        result.resources.modulesList = [i18nModuleResource];

        result.resources.cardsList = [];
        // link each card from list
        for (const card of inputStructure.cards) {
            result.resources.cardsList.push(this.generateCardModuleResource(card));
        }


        // ~~~~~~~~~~~ ordered card layout views List and grid behavior ~~~~~~~~~~~~~~~~~~
        result.resources.viewsList = [];

        // there is a static fixed size, but if more cards are added, then allow for some growth in the project space
        const maximumSizeGrowthFactor = 2; // predict twice the expansion capability

        const baseOne = 1;
        const cardDashboardViewConfigurationModuleResource: ResourceFacade<ResourceModuleSchema, ResourceModuleSchema> = {} as any;
        result.resources.viewsList.push(cardDashboardViewConfigurationModuleResource);

        cardDashboardViewConfigurationModuleResource.resourceId = `${inputStructure.id}:dashboard-grid-configuration`;
        cardDashboardViewConfigurationModuleResource.type = "dashboard-view-configuration";
        cardDashboardViewConfigurationModuleResource.component = "grid-container-dashboard-container";

        cardDashboardViewConfigurationModuleResource.resolver = {
            injector: "dashboard-assembly-grid-configuration",

            node: {
                type: "card-assembly-integration",
                data: {
                    // should go away...
                    gridType: "fixed",
                    // reasonable initial sizing based upon supplied card layouts. Their layouts should not break the UX rules
                    minCols: 3,
                    // tslint:disable-next-line:no-bitwise
                    maxCols: (Math.max(inputStructure.cards.length, Math.max(...inputStructure.cards.map((card) => card.layout.x))) + baseOne) * maximumSizeGrowthFactor >> 0,

                    // minRows: 4,
                    // maxRows: 10,

                    minRows: Math.max(Math.max(...inputStructure.cards.map((card) => card.layout.y)) + baseOne , baseOne), // minimal at least a postive integer
                    // tslint:disable-next-line:no-bitwise
                    maxRows: (Math.max(inputStructure.cards.length, Math.max(...inputStructure.cards.map((card) => card.layout.y))) + baseOne) * maximumSizeGrowthFactor >> 0,

                    mobileBreakpoint: 0,

                    swap: false,
                    margin: 50,
                    fixedColWidth: 180,
                    fixedRowHeight: 60,

                    compactType: "none",
                    resizable: {
                        enabled: true
                    }
                }
            }
        } as any;

        // organization and ordering

        const cardDashboardViewStateModuleResource: ResourceFacade<ResourceModuleSchema, ResourceModuleSchema> = {} as any;
        result.resources.viewsList.push(cardDashboardViewStateModuleResource);

        cardDashboardViewStateModuleResource.resourceId = `${inputStructure.id}:dashboard-item-layout`;
        cardDashboardViewStateModuleResource.type = "dashboard-view-state";
        cardDashboardViewStateModuleResource.component = cardDashboardViewConfigurationModuleResource.component;

        const cardDashboardViewStateData: DashboardAssemblyGridContainerSchema = {} as any;

        cardDashboardViewStateData.dashboard = {
            // application will underpin a canvas layer that maps to coordinate dimensions of gridster container
            view: {viewportScalableSizing: true, viewportPositionRelative: true, theme: null as any}, // deprecate theme from API
            container: {
                layoutColumnsBreakpointList: null as any, // should be optional
                layoutItemList: inputStructure.cards.map((card): DashboardAssemblyGridContainerLayoutItemSchema => {
                    return {
                        card: {resourceId: card.id},
                        layout: {
                            position: {x: card.layout.x, y: card.layout.y},
                            dimensions: {initial: {width: card.layout.width, height: card.layout.height}}
                        }
                    } as DashboardAssemblyGridContainerLayoutItemSchema;
                })

            }
        };

        cardDashboardViewStateModuleResource.resolver = {
            injector: "dashboard-assembly-grid-container",
            node: {data: cardDashboardViewStateData}
        } as any;

        return result;
    }

    // supports on-demand card creation to add to an existing deck
    public generateCardModuleResource(card: AssetNodeConfigurationCardSchema): DashboardConfigurationResourceSchema {

        const cardModuleResource: DashboardConfigurationResourceSchema = {} as any;
        // card layout resource
        const cardAssemblyLayout: ExtensibilityFrameworkConsumer = {} as any;
        cardAssemblyLayout.id = `${card.id}`;
        cardAssemblyLayout.resources = {};
        cardAssemblyLayout.resources.modulesList = [];


        // =============== card i18n ==================
        if (card.header) {
            const cardI18nModuleResource: ResourceFacade<ResourceModuleSchema, ResourceModuleSchema> = {} as any;
            cardAssemblyLayout.resources.modulesList.push(cardI18nModuleResource);

            cardI18nModuleResource.resourceId = `${card.id}:resource-i18n`;
            cardI18nModuleResource.type = "i18n";
            cardI18nModuleResource.resolver = {
                injector: "dashboard-assembly-translation",
                node: {
                    data: {"card.title": card.header.title}
                }
            } as any;
        } else {
            console.error("missing header declaration in card", card.id);
        }

        // =============== card data supplier service layer ==================

        // metadata-defined service pipeline is optional, however the engine requires an explicit No-Op
        if (!this.isArrayWithItems(card.services)) {
            card.services = [{[NoOperationResolver.metastructure.identifier]: {}} as any];
        }

        if (Array.isArray(card.services)) {

            for (const serviceStructure of card.services) {

                for (const serviceStructureResolverType of Object.keys(serviceStructure)) {

                    const cardResolverServiceModuleResource: ResourceFacade<ResourceModuleSchema, ResourceModuleSchema> = {} as any;
                    cardAssemblyLayout.resources.modulesList.push(cardResolverServiceModuleResource);

                    cardResolverServiceModuleResource.resourceId = `${card.id}:resource-service:${serviceStructureResolverType}`;
                    cardResolverServiceModuleResource.type = "service";

                    // dataservice over network type
                    if (serviceStructureResolverType === "network") {

                        // optional sync flag, only when present to override, might have more
                        const optionalNetworkPropList = ["isSync"];

                        cardResolverServiceModuleResource.resolver = {
                            [serviceStructureResolverType]: {
                                url: serviceStructure[serviceStructureResolverType]!.url,
                                isEvaluated: true // allows for synthetic data-bound URL expressions
                            }
                        } as any;

                        // determine optionals
                        optionalNetworkPropList.forEach((optionalProp) =>
                            this.bindOptionalProperty(serviceStructure[serviceStructureResolverType]!, cardResolverServiceModuleResource.resolver[serviceStructureResolverType], optionalProp)
                        );

                        // default all other resolvers by honoring props
                    } else {
                        cardResolverServiceModuleResource.resolver = {[serviceStructureResolverType]: serviceStructure[serviceStructureResolverType]} as any;
                    }

                }

            }
        } else {

            // create stubbed service when nothing
            // console.error("no service");

        }


        // =============== card resource parameters ==================
        if (card.header) {
            const cardParametersModuleResource: ResourceFacade<ResourceModuleSchema, ResourceModuleSchema> = {
                resourceId: `${card.id}:resource-parameters`,
                type: "parameters",
                resolver: {
                    node: {
                        type: "card-assembly-parameters",
                        data: {}
                    }
                } as any
            } as any;
            cardAssemblyLayout.resources.modulesList.push(cardParametersModuleResource);

            const cardAssemblyParametersData = cardParametersModuleResource.resolver["node"].data;

            // UX defaults
            cardAssemblyParametersData["card.isHeaderVisible"] = true;

            if (card.header.icon) {
                cardAssemblyParametersData["card.iconClassesList"] = [card.header.icon];
            }

            // =============== clone definition business specialization metadata ==================
            if (card.metadata) {
                Object.keys(card.metadata).forEach((key) => this.bindOptionalProperty(card.metadata, cardAssemblyParametersData, key));
            }

        }


        // ~~~~~~~~~~~ componentsList ~~~~~~~~~~~~~~~~~~
        cardAssemblyLayout.resources.componentsList = [];

        // ================ template binding to card assembly ===========
        if (card.templates) {

            const cardTemplateModuleResource: ResourceFacade<ResourceModuleSchema, ResourceModuleSchema> = {} as any;
            cardAssemblyLayout.resources.componentsList.push(cardTemplateModuleResource);

            cardTemplateModuleResource.resourceId = `${card.id}:resource-card-assembly`;
            cardTemplateModuleResource.type = "component-layout-metadata";
            cardTemplateModuleResource.component = `${card.id}:resource-component`;

            if (this.isArrayWithItems(card.templates)) {

                const cardFields = [];

                for (const templateStructure of card.templates) {

                    const possibleLayoutPositionsList = ["header", "body", "footer"];
                    for (const layoutPosition of possibleLayoutPositionsList) {

                        const positionedTemplateStructure = templateStructure[layoutPosition];
                        if (positionedTemplateStructure) {

                            cardFields.push(
                                {
                                    id: positionedTemplateStructure.template,
                                    view: {
                                        [layoutPosition]: {
                                            organization: positionedTemplateStructure.organization,
                                            template: positionedTemplateStructure.template
                                        }
                                    }
                                }
                            );

                        }

                    }

                }

                cardTemplateModuleResource.resolver = {
                    node: {
                        type: "card-assembly-integration",
                        data: {
                            card: {
                                fields: cardFields
                            }
                        }
                    }
                } as any;

            }

        } else {
            console.error("missing templates declaration in card", card.id);
        }

        cardModuleResource.resourceId = card.id;
        cardModuleResource.component = card.component;
        cardModuleResource.type = "card";
        cardModuleResource.resolver = {
            injector: "dashboard-assembly-layout",
            node: {
                data: cardAssemblyLayout
            }
        } as any;


        return cardModuleResource;
    }

    private isArrayWithItems(potentialArray: Array<any> | undefined | null): boolean {
        return !(!Array.isArray(potentialArray) || (Array.isArray(potentialArray) && potentialArray.length === 0));
    }

    // private cloneJsonNode(sourceObject: any): any { return JSON.parse(JSON.stringify(sourceObject)); }

    private bindOptionalProperty(sourceObject: any, targetObject: any, propertyName: string) {
        if (sourceObject.hasOwnProperty(propertyName)) {
            targetObject[propertyName] = sourceObject[propertyName];
        }
    }

}

const providedConfigurationInstance = new NodeflowConfigurationPreprocessor();
export const nodeflowConfigSchemaTransformerAction = providedConfigurationInstance.transform.bind(providedConfigurationInstance);


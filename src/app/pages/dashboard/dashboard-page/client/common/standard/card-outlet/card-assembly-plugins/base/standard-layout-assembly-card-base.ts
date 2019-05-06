import { TemplateRef } from "@angular/core";
import { StandardCardPluginServiceBase } from "./standard-card-plugin-service-base";
import { Observable } from "rxjs";
import { FieldBaseMetadata } from "ngx-card-deck";
import {
    CardPluginBaseClassService,
    LayoutAssemblyCardBase, TemplateLibraryManager
} from "ngx-card-deck";
import {
    CardOutletComponent,
    DashboardCardModelSchema
} from "ngx-card-deck";
import { DashboardAssemblyLayout } from "ngx-card-deck";


export abstract class StandardLayoutAssemblyCardBase<T extends DashboardCardModelSchema,
    F extends FieldBaseMetadata, S extends CardPluginBaseClassService<T>, E> extends LayoutAssemblyCardBase<T> {

    public initialDataModelResponse$: Observable<T>;

    public isTemplatePhaseReady = false;
    public isComponentPhaseReady = false;


    // position-based view mapping
    public positionBasedTemplateMap = {
        header: {} as { [identifier: string]: TemplateRef<any> },
        body: {} as { [identifier: string]: TemplateRef<any> },
        footer: {} as { [identifier: string]: TemplateRef<any> }
    };

    // layout related metadata properties
    public layout: {
        availableScrollHeightMetric: number;
    } = {} as any;

    public fieldMetadataList: Array<F>;

    // holds iterable records for the "primary" functional data of the view. Multiple data streams should just write their own
    public widgetDataEntity: E;

    public library: TemplateLibraryManager; // collection of template-oriented libraries
    protected _service: StandardCardPluginServiceBase<T>;

    protected _outlet: CardOutletComponent;
    // data pointer to assembly layout
    protected assemblyLayout: DashboardAssemblyLayout<any>;

    public prepareTemplate() {

        this.assemblyLayout = this.resourceToken.card.resolver.injectorInstance as DashboardAssemblyLayout<any>;
        this.initialDataModelResponse$ = this.prepareDataStream();

        this.startInteractionEvents(); // base

        const assemblyLayoutClassMetadata = this.assemblyLayout.classificationMetadata();
        const assemblyLayoutState = this.assemblyLayout.state();

        // resolve and bootstrap custom template(s) that have a dependency from this component when rendering
        const componentLayoutInstanceMetadata = assemblyLayoutState.findConfigurationResourceByType(
            assemblyLayoutClassMetadata.layoutResourceType,
            assemblyLayoutClassMetadata.layoutMetadataKey);

        if (componentLayoutInstanceMetadata) {

            this._service.loadingDashboardCardTemplatableClass(this.resourceToken.card, componentLayoutInstanceMetadata)
                .then((clazz) => {

                        if (clazz) {
                            // page binding module and template component bootstrapping
                            this._service.loadingDashboardCardTemplatableModule(this.resourceToken.card, componentLayoutInstanceMetadata)
                                .then((templatableModuleFactory) => {

                                    this.derivedTemplatableClass = clazz;
                                    this.derivedTemplateModuleFactory = templatableModuleFactory;

                                    setTimeout(() => {
                                        // integration steps phased after tick
                                        this.isTemplatePhaseReady = true; // step1
                                        this._cd.markForCheck(); // deps load and prep
                                    }, 0);

                                    this.isComponentPhaseReady = true; // step2 - alas render widget component
                                    this._cd.markForCheck();

                                }, (failure) => {

                                    console.error("bundle unavailable", assemblyLayoutClassMetadata);
                                });
                        }

                    },
                    (rejection) => {
                        // note: a template is not required per-se, as the fundamental widget may be sufficient without extension
                        // however, a template cannot be loaded unless the metadata declares it *per field*
                        console.error("template association failure", this.resourceToken.card.resourceId, rejection);
                    }
                );

        } else {
            console.error("unresolvable", Object.getPrototypeOf(this).constructor.name, "configuration resource",
                assemblyLayoutState, assemblyLayoutClassMetadata.layoutMetadataKey);
        }

        // meanwhile, extract field definitions
        this.fieldMetadataList = this._service.prepareFieldMetadataList<F>(this.resourceToken.card);

        // after requesting data, setup fields
        // establish templating views
        this.fieldMetadataList.forEach((col) => {
            this.positionBasedTemplateMap.header[col.id] = this.defaultHeaderTemplate; // default
            this.positionBasedTemplateMap.body[col.id] = this.defaultBodyTemplate; // default
        });
    }

    public setupHeaderSection() {
        this._outlet.isHeaderVisible = Boolean(this.library.alias.parameters["card.isHeaderVisible"]) || false;
        this._outlet.title = this.library.alias.cardI18n["card.title"];
        this._outlet.titleIconClasses = this.library.alias.parameters["card.iconClassesList"] as Array<string>;
        // subtitle to be addressed by subclass
    }

    public abstract prepareDataStream(): Observable<T>;

}

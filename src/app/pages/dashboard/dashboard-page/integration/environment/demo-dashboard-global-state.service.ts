import { Injectable, NgZone } from "@angular/core";
import { Observable } from "rxjs";
import { DemoAppSessionObserverService } from "../../client/core/com.company.group/lib/services/sample-product/platform/demo-app-session-observer.service";
import {
    DemoDashboardOrganizerPackageEnumeration,
    getOrganizerPackageKey
} from "../card-outlet/demo-dashboard-organizer-package.class";
import { DemoDashboardBusinessEntityState } from "./demo-dashboard-business-entity.state";
import {
    DemoDashboardAccessorTemplatingMixinSchema, DemoDashboardAccessorTemplatingSchema,
    DemoDashboardUserLocaleEntity
} from "./demo-dashboard-business-context-entity.state.interface";
import { publishLast, refCount } from "rxjs/operators";
import { DeploymentConfigurationBase, GlobalStateBase } from "ngx-card-deck";
import { ResourceFacade } from "ngx-card-deck";
import { MessageResult } from "ngx-card-deck";

// monitor for a data refresh interaction from client

@Injectable()
export class DemoDashboardGlobalStateService extends GlobalStateBase {

    // stricter types for demo
    protected _selectedOrganizerEnumerationKey: DemoDashboardOrganizerPackageEnumeration;
    protected _appStateContext: DemoDashboardBusinessEntityState; // supplied context from outside dashboard
    protected _locale: DemoDashboardUserLocaleEntity; // current localization/Language

    // unique properties to just the demo card
    private _userSession$: Observable<any>;

    constructor(protected _zone: NgZone,
                private _sessionObserver: DemoAppSessionObserverService,
                private _deploymentConfiguration: DeploymentConfigurationBase) {
        super();

        this._sessionObserver.setState(this); // supply inject

        // if necessary override _dataStream with custom listeners

        if (this._deploymentConfiguration.deploymentMetadata.page.sandboxed) {
            this.activateSandboxedServices();
        }

    }

    get userSessionStream(): Observable<any> {
        return this._userSession$;
    }

    // preservation of stream, emits recent even after sequence was originally generated
    set userSessionStream(o: Observable<any>) {
        this._userSession$ = o.pipe(publishLast(), refCount());
    }

    // strictness
    get selectedOrganizerEnumerationKey(): DemoDashboardOrganizerPackageEnumeration {
        return this._selectedOrganizerEnumerationKey;
    }

    set selectedOrganizerEnumerationKey(o: DemoDashboardOrganizerPackageEnumeration) {
        this._selectedOrganizerEnumerationKey = o;
    }


    // startup phase requirement for session
    public streamUserSession(): Observable<MessageResult> {
        return this._sessionObserver.getUserSessionStream();
    }


    /**
     * required state emitter: consumed by many parsers when resolving paths - especially the template driven ones
     */
    public deriveStateAccessor<T, U>(currentResource: ResourceFacade<T, U>): DemoDashboardAccessorTemplatingSchema {

        const mixin: DemoDashboardAccessorTemplatingMixinSchema = {
            organization: {
                // extension: business proprietary to business team specifics as necessary
                company: {
                    businessContext: this._appStateContext
                }
            },

            locale: this._locale
        };

        // extending core templating ideas
        return Object.assign(super.deriveStateAccessor(currentResource), mixin);
    }

    // ---------- internal state accessors -------------

    // standard context passed around framework
    get businessStateContext(): DemoDashboardBusinessEntityState {
        return this._appStateContext;
    }

    set businessStateContext(ref: DemoDashboardBusinessEntityState) {
        this._appStateContext = ref;
    }


    /**
     * convention: change key Enumeration syntax for a key like "com_company_extension" into dotted-path notation used consistently for folder "com.company.extension"
     */
    protected resolveOrganizerPackagePath(): string {
        return getOrganizerPackageKey(this.selectedOrganizerEnumerationKey).replace(/_/g, ".");
    }

    /**
     * activate those dependent services that are sandboxed ( a concept meaning not standalone )
     * for example when embedded in H5, available services are different
     */
    private activateSandboxedServices() {
    }

}

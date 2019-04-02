// essentials for personalization
import { DemoDashboardBusinessEntityState } from './demo-dashboard-business-entity.state';
import {
    AccessorTemplatingBaseSchema, BusinessContextEntityBaseStateful,
    LocaleBaseEntity, RouteAccessorBaseSchema, ServiceSandboxedBaseCapable
} from "ngx-card-deck";


export interface DemoDashboardUserLocaleEntity extends LocaleBaseEntity {
   // demo business extensions ideas for locale
   timezone: string;
   country: string;
   browser: string;
}

// mixin
export interface DemoDashboardAccessorTemplatingMixinSchema {
   // decoration specifics for demo card
   organization: {
      company: {
         businessContext: DemoDashboardBusinessEntityState; // supplied context from outside dashboard
      }
   };

   locale: DemoDashboardUserLocaleEntity;
}

// union of a mixin + module's default
export interface DemoDashboardAccessorTemplatingSchema extends DemoDashboardAccessorTemplatingMixinSchema, AccessorTemplatingBaseSchema {

}

export enum DemoDashboardGlobalEventBaseTopic {
   // clone of GlobalEventBaseTopic
   domainReportChange, // switches domains
   subscriberNavigationChanged  // navigation event

   // business extensions...
}

// presumed setup path by organizer
// tslint:disable-next-line:no-empty-interface
export interface DemoDashboardRouteAccessorBaseSchema extends RouteAccessorBaseSchema {
}


// abstract - expect consumer to add plenty of more specifics
// tslint:disable-next-line:no-empty-interface
export interface DemoDashboardAccessorTemplatingBaseSchema extends AccessorTemplatingBaseSchema {

}


// tslint:disable-next-line:no-empty-interface
export interface DemoDashboardBusinessContextEntityBaseStateful extends BusinessContextEntityBaseStateful {
// client to implement its own fundamentals
}


// tslint:disable-next-line:no-empty-interface
export interface DemoDashboardServiceSandboxedBaseCapable extends ServiceSandboxedBaseCapable {

}



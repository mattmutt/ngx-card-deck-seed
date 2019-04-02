import { SummaryBillboardDataModelSchema } from "./summary-billboard.interface";
import { DashboardCardModelSchema } from "ngx-card-deck";


// typed class that holds the data
// able to transform and mutate, based upon business rule strategies
export class SummaryBillboardDataModel implements DashboardCardModelSchema {
   // envelope holding records
   response: {
      entity: SummaryBillboardDataModelSchema
   };
}



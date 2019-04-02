// able to transform and mutate, based upon business rule strategies
import { DashboardCardModelSchema } from "ngx-card-deck";

export class SimpleGridDataModel implements DashboardCardModelSchema {
   // envelope holding records
   response: {
      records: Array<any>;
   };
}



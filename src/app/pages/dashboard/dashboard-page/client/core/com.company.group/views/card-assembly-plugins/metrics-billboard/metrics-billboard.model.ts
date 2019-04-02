import { MetricsBillboardDataRecordEntitySchema } from "./metrics-billboard.interface";
import { DashboardCardModelSchema } from "ngx-card-deck";


// able to transform and mutate, based upon business rule strategies
export class MetricsBillboardDataModel implements DashboardCardModelSchema {
   // envelope holding records
   response: {
      entity: MetricsBillboardDataRecordEntitySchema;
   };
}



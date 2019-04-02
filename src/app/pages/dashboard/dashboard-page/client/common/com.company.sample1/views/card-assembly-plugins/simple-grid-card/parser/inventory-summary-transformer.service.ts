import { Injectable } from "@angular/core";
import { ParsedResponseTransformBase } from "../../../../../../core/com.company.group/lib/services/sample-product/dataservice/response-parser-base.class";


// strategies based upon some token
@Injectable()
export class InventorySummaryTransformerService extends ParsedResponseTransformBase {


   constructor() {
      super();
   }

   public getStrategyIdentifier() {
      return "InventorySummaryTransformerService";
   }


   // step 1 extract collection
   public extract(serverResponse: any): Array<any> {

      const dashboardServiceAllocatedCollectionName = "breakdownData";
      // service embeds collection with
      return serverResponse.response.entity[dashboardServiceAllocatedCollectionName];
   }


   // step 2 transform collection to view DAO
   // view helper: create subset of only visible columns, localize the displayed label
   public transform(dataItems: Array<any>): Array<any> {


      return dataItems.map((item) => {
         const entity: any = {
            // column :: server field
            "inventory_entity_name": item.name,
            "inventory_entity_count": item.necount,
            "inventory_entity_percentage": item.precentage
         };


         return entity;
      });

   }


}

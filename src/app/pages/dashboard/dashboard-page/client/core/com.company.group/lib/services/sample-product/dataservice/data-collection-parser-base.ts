import { StandardResponseParserTransformable } from "../../../../../../common/standard/card-outlet/card-assembly-plugins/base/standard-response-parser-base";
import { ParsedResponseTransformBase } from "./parsed-response-transform-base.class";

interface StrategyTransformerSchema {
    [identifier: string]: StandardResponseParserTransformable<any>;
}

export class DataCollectionParserBase {

    strategyTransformerMap: StrategyTransformerSchema = {/* injectables map */};

    constructor(args: any) {
        // initialize
        this.applyInjection(args);
    }


    // as many customized data transformers, add them here as DI
    private applyInjection(args: any) {

        // map of <ParsedResponseTransformable> tagged by metadata
        const injectableList = Array.prototype.slice.call(args);

        injectableList.filter((inject: any) => {
            if (inject instanceof ParsedResponseTransformBase) {
                this.strategyTransformerMap[inject.getStrategyIdentifier()] = inject;
            }
        });

    }

}

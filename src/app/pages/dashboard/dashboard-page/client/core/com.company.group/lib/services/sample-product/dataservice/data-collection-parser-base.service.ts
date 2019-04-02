import { ParsedResponseTransformable, ParsedResponseTransformBase } from "./response-parser-base.class";

interface StrategyTransformerSchema {
    [ identifier: string ]: ParsedResponseTransformable;
}

export class DataCollectionParserBaseService {

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

import { NodeModel } from "../node.model";
import { CardConfigurationModelParameterSchema } from "../../../nodeflow-studio-connector-loader.service";

export enum CardNodeValidationRuleType {
    general,
    establishRelationFromMessageToProducerSocket
}

export class CardNodeValidationStatus {
    type: CardNodeValidationRuleType; // step of validation process
    status: boolean; // pass/fail
    message: string; // human understandable
}

export class CardNodeParseValidator {
    node: NodeModel;
    validations: Set<CardNodeValidationStatus> = new Set();

    createValidationStatus(type: CardNodeValidationRuleType, status: boolean, message: string): CardNodeValidationStatus {
        const validationResult = new CardNodeValidationStatus();
        validationResult.type = type;
        validationResult.status = status;
        validationResult.message = message;

        this.validations.add(validationResult);

        return validationResult;
    }

}

export class CardSubjectsParseValidatorManager {
    configurationModelParameterMap: Map<string, CardConfigurationModelParameterSchema> = new Map();
    subjects: Set<CardNodeParseValidator> = new Set();


    // arrange a new validator subject by node model
    createCardNodeSubjectValidator(nodeModel: NodeModel): CardNodeParseValidator {
        const cnpv = new CardNodeParseValidator();
        cnpv.node = nodeModel;

        this.subjects.add(cnpv);
        return cnpv;
    }

    // arrange a new validator subject by node model
    findCardNodeSubjectValidatorById(id: string): CardNodeParseValidator | undefined {
        return Array.from(this.subjects).find((validatorSubject) => validatorSubject.node.id === id);
    }


    // how many errors were caught during parsing and importing
    get errorValidationCount(): number {
        const count = Array.from(this.subjects)
            .reduce((accumulator, curr, idx) => (accumulator + Array.from(curr.validations)
                .reduce((accumulator2, curr2, idx2) => (accumulator2 + (curr2.status ? 0 : 1)), 0)), 0);

        return count;
    }

    get validStatus(): boolean {
        return this.errorValidationCount === 0;
    }


}


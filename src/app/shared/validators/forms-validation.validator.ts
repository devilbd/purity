import { Validator, BaseValidator } from '../../../framework/core';

@Validator({
    form: '.forms-validation-form',
    fields: {
        input1: '#input1',
        input2: '#input2',
    },
    validClass: 'is-valid',
    invalidClass: 'is-invalid',
})
export class FormsValidationValidator extends BaseValidator {
    validateInput1(value: string): boolean {
        return value.trim().length >= 3;
    }

    validateInput2(value: string): boolean {
        return value.trim().length >= 5;
    }
}

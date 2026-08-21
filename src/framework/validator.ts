import type { Constructor } from './di';

export interface FieldValidationConfig {
    selector: string;
    validClass?: string;
    invalidClass?: string;
    validate?: (value: string, element: HTMLElement) => boolean;
}

export interface ValidatorOptions {
    form: string; // Form selector, e.g. 'form', '.forms-validation-form', '#myForm'
    fields: Record<string, string | FieldValidationConfig>; // Map of field names to their selectors or configs
    validClass?: string; // Default CSS class when field is valid (default: 'is-valid')
    invalidClass?: string; // Default CSS class when field is invalid (default: 'is-invalid')
    events?: string[]; // Events to trigger validation on (default: ['input', 'change', 'blur'])
}

export interface ValidatorLifecycle {
    form: HTMLFormElement | HTMLElement | null;
    fields: Map<string, HTMLElement>;
    isValid: boolean;
    onInit?(): void;
    onDestroy?(): void;
    validateAll?(): boolean;
    onFieldChange?(
        fieldName: string,
        value: string,
        isValid: boolean,
        element: HTMLElement,
    ): void;
    [key: string]: any;
}

export abstract class BaseValidator implements ValidatorLifecycle {
    form: HTMLFormElement | HTMLElement | null = null;
    fields: Map<string, HTMLElement> = new Map();
    isValid: boolean = false;

    onInit?(): void;
    onDestroy?(): void;
    onFieldChange?(
        fieldName: string,
        value: string,
        isValid: boolean,
        element: HTMLElement,
    ): void;

    validateAll(): boolean {
        return this.isValid;
    }
}

export const validatorRegistry = new Map<
    string,
    {
        constructor: Constructor<ValidatorLifecycle>;
        options: ValidatorOptions;
    }
>();

/**
 * Decorator to register a class as a Form Validator.
 * Uses the form selector and described fields to attach validation.
 *
 * @example
 * ```typescript
 * @Validator({
 *     form: '.forms-validation-form',
 *     fields: {
 *         input1: '#input1',
 *         input2: '#input2',
 *     },
 *     validClass: 'is-valid',
 *     invalidClass: 'is-invalid',
 * })
 * export class MyFormValidator extends BaseValidator {
 *     validateInput1(value: string): boolean {
 *         return value.trim().length >= 3;
 *     }
 * }
 * ```
 */
export function Validator(options: ValidatorOptions) {
    return function <T extends Constructor>(
        target: T,
        _context?: ClassDecoratorContext<T> | any,
    ): T | void {
        validatorRegistry.set(options.form, {
            constructor: target as unknown as Constructor<ValidatorLifecycle>,
            options,
        });

        return target;
    };
}

/**
 * Helper to resolve the validation method name on a validator instance.
 * E.g., for field 'input1' -> 'validateInput1', 'validate_input1', 'validateinput1', 'input1', or 'validateField'
 */
function findValidationMethod(
    instance: any,
    fieldName: string,
): ((value: string, element: HTMLElement) => boolean) | null {
    const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    const candidates = [
        `validate${capitalized}`,
        `validate_${fieldName}`,
        `validate${fieldName.toLowerCase()}`,
        `validateField`,
        fieldName,
    ];

    for (const name of candidates) {
        if (typeof instance[name] === 'function') {
            if (name === 'validateField') {
                return (value: string, element: HTMLElement) =>
                    instance.validateField(fieldName, value, element);
            }
            return (value: string, element: HTMLElement) =>
                instance[name](value, element);
        }
    }

    return null;
}

/**
 * Scans a DOM tree for forms matching registered validators and attaches field validations.
 */
export function bindValidators(
    root: HTMLElement,
    _context: any = root,
): Array<{ destroy: () => void }> {
    const activeValidators: Array<{ destroy: () => void }> = [];

    for (const [formSelector, { constructor: ValidatorConstructor, options }] of validatorRegistry.entries()) {
        const matchingForms: HTMLElement[] = [];
        if (root.matches(formSelector)) {
            matchingForms.push(root);
        }
        matchingForms.push(
            ...Array.from(root.querySelectorAll<HTMLElement>(formSelector)),
        );

        for (const formEl of matchingForms) {
            const instance = new ValidatorConstructor();
            instance.form = formEl;
            instance.fields = new Map();

            const defaultValidClass = options.validClass || 'is-valid';
            const defaultInvalidClass = options.invalidClass || 'is-invalid';
            const eventNames = options.events || ['input', 'change', 'blur'];

            const listenersToClean: Array<() => void> = [];
            const fieldValidationState = new Map<string, boolean>();

            const validateSingleField = (
                fieldName: string,
                fieldEl: HTMLElement,
                fieldConfig: string | FieldValidationConfig,
            ): boolean => {
                const validClass =
                    (typeof fieldConfig === 'object' && fieldConfig.validClass) ||
                    defaultValidClass;
                const invalidClass =
                    (typeof fieldConfig === 'object' && fieldConfig.invalidClass) ||
                    defaultInvalidClass;

                const value =
                    fieldEl instanceof HTMLInputElement ||
                    fieldEl instanceof HTMLTextAreaElement ||
                    fieldEl instanceof HTMLSelectElement
                        ? fieldEl.value
                        : fieldEl.textContent || '';

                let isValid = false;

                const method =
                    (typeof fieldConfig === 'object' && fieldConfig.validate) ||
                    findValidationMethod(instance, fieldName);

                if (method) {
                    isValid = !!method.call(instance, value, fieldEl);
                } else {
                    // Default validation: non-empty check
                    isValid = value.trim().length > 0;
                }

                if (isValid) {
                    fieldEl.classList.remove(invalidClass);
                    fieldEl.classList.add(validClass);
                } else {
                    fieldEl.classList.remove(validClass);
                    fieldEl.classList.add(invalidClass);
                }

                fieldValidationState.set(fieldName, isValid);
                instance.onFieldChange?.(fieldName, value, isValid, fieldEl);

                instance.isValid = Array.from(fieldValidationState.values()).every(Boolean);
                return isValid;
            };

            // Bind each configured field
            for (const [fieldName, fieldConfig] of Object.entries(options.fields)) {
                const fieldSelector =
                    typeof fieldConfig === 'string'
                        ? fieldConfig
                        : fieldConfig.selector;

                const fieldEl = formEl.querySelector(fieldSelector) as HTMLElement | null;

                if (fieldEl) {
                    instance.fields.set(fieldName, fieldEl);
                    fieldValidationState.set(fieldName, false);

                    const handler = () => {
                        validateSingleField(fieldName, fieldEl, fieldConfig);
                    };

                    for (const evt of eventNames) {
                        fieldEl.addEventListener(evt, handler);
                        listenersToClean.push(() =>
                            fieldEl.removeEventListener(evt, handler),
                        );
                    }
                }
            }

            // Provide validateAll method
            instance.validateAll = (): boolean => {
                let allValid = true;
                for (const [fieldName, fieldConfig] of Object.entries(options.fields)) {
                    const fieldEl = instance.fields.get(fieldName);
                    if (fieldEl) {
                        const fieldValid = validateSingleField(fieldName, fieldEl, fieldConfig);
                        if (!fieldValid) allValid = false;
                    }
                }
                instance.isValid = allValid;
                return allValid;
            };

            // Form submit handler
            const submitHandler = (e: Event) => {
                const allValid = instance.validateAll?.() ?? false;
                if (!allValid) {
                    e.preventDefault();
                }
            };
            formEl.addEventListener('submit', submitHandler);
            listenersToClean.push(() =>
                formEl.removeEventListener('submit', submitHandler),
            );

            instance.onInit?.();

            activeValidators.push({
                destroy: () => {
                    listenersToClean.forEach((cleanup) => cleanup());
                    instance.onDestroy?.();
                },
            });
        }
    }

    return activeValidators;
}

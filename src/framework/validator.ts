import type { Constructor } from './di';

export interface FieldValidationConfig {
    selector: string;
    validClass?: string;
    invalidClass?: string;
    validate?: (value: string, element: HTMLElement) => boolean;
}

export interface ValidatorOptions {
    form: string; // Form selector, e.g. 'form', '.forms-validation-form', '#myForm'
    fields: Record<string, string | FieldValidationConfig>; // Map of field names to selectors/configs
    validClass?: string; // Default CSS class when field/form is valid (default: 'is-valid')
    invalidClass?: string; // Default CSS class when field/form is invalid (default: 'is-invalid')
    events?: string[]; // Events to trigger validation on (default: ['input', 'change', 'blur'])
}

export interface ValidatorLifecycle {
    form: HTMLFormElement | HTMLElement | null;
    fields: Map<string, HTMLElement>;
    submitButtons: HTMLElement[];
    isValid: boolean;
    onInit?(): void;
    onDestroy?(): void;
    validateAll?(): boolean;
    updateFormState?(isValid: boolean): void;
    onFieldChange?(
        fieldName: string,
        value: string,
        isValid: boolean,
        element: HTMLElement,
    ): void;
    onStateChange?(isValid: boolean, validator: this): void;
    [key: string]: any;
}

export abstract class BaseValidator implements ValidatorLifecycle {
    form: HTMLFormElement | HTMLElement | null = null;
    fields: Map<string, HTMLElement> = new Map();
    submitButtons: HTMLElement[] = [];
    isValid: boolean = false;

    onInit?(): void;
    onDestroy?(): void;
    onFieldChange?(
        fieldName: string,
        value: string,
        isValid: boolean,
        element: HTMLElement,
    ): void;
    onStateChange?(isValid: boolean, validator: this): void;

    validateAll(): boolean {
        return this.isValid;
    }

    updateFormState(isValid: boolean): void {
        this.isValid = isValid;
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
 * Automatically tracks field mutations and toggles submit button disabled states and CSS classes.
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
 * Scans a DOM tree for forms matching registered validators and attaches form and field validation.
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

            // Locate submit buttons inside the form
            const submitButtons = Array.from(
                formEl.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
                    'button[type="submit"], input[type="submit"], button:not([type]), .form-submit-btn',
                ),
            ).filter(
                (el) =>
                    el.tagName === 'BUTTON' ||
                    (el instanceof HTMLInputElement && el.type === 'submit') ||
                    (el as any).type === 'submit',
            );
            instance.submitButtons = submitButtons;

            const defaultValidClass = options.validClass || 'is-valid';
            const defaultInvalidClass = options.invalidClass || 'is-invalid';
            const eventNames = options.events || ['input', 'change', 'blur'];

            const listenersToClean: Array<() => void> = [];
            const fieldValidationState = new Map<string, boolean>();

            // Method to update form state, CSS classes, and submit buttons
            const updateFormState = (isValid: boolean) => {
                instance.isValid = isValid;

                for (const btn of submitButtons) {
                    if ('disabled' in btn) {
                        (btn as HTMLButtonElement).disabled = !isValid;
                    }
                    if (isValid) {
                        btn.classList.remove('disabled');
                    } else {
                        btn.classList.add('disabled');
                    }
                }

                if (isValid) {
                    formEl.classList.remove(defaultInvalidClass);
                    formEl.classList.add(defaultValidClass);
                } else {
                    formEl.classList.remove(defaultValidClass);
                    formEl.classList.add(defaultInvalidClass);
                }

                instance.onStateChange?.(isValid, instance);
            };
            instance.updateFormState = updateFormState;

            // Evaluates whether a field value is valid without modifying DOM classes
            const evaluateFieldValidity = (
                fieldName: string,
                fieldEl: HTMLElement,
                fieldConfig: string | FieldValidationConfig,
            ): boolean => {
                const value =
                    'value' in fieldEl
                        ? String((fieldEl as any).value ?? '')
                        : fieldEl.textContent || '';

                const method =
                    (typeof fieldConfig === 'object' && fieldConfig.validate) ||
                    findValidationMethod(instance, fieldName);

                if (method) {
                    return !!method.call(instance, value, fieldEl);
                }
                return value.trim().length > 0;
            };

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
                    'value' in fieldEl
                        ? String((fieldEl as any).value ?? '')
                        : fieldEl.textContent || '';

                const isValid = evaluateFieldValidity(fieldName, fieldEl, fieldConfig);

                if (isValid) {
                    fieldEl.classList.remove(invalidClass);
                    fieldEl.classList.add(validClass);
                } else {
                    fieldEl.classList.remove(validClass);
                    fieldEl.classList.add(invalidClass);
                }

                fieldValidationState.set(fieldName, isValid);
                instance.onFieldChange?.(fieldName, value, isValid, fieldEl);

                const allValid =
                    fieldValidationState.size === Object.keys(options.fields).length &&
                    Array.from(fieldValidationState.values()).every(Boolean);

                updateFormState(allValid);
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

                    // Compute initial validity for each field
                    const initiallyValid = evaluateFieldValidity(fieldName, fieldEl, fieldConfig);
                    fieldValidationState.set(fieldName, initiallyValid);

                    const handler = () => {
                        validateSingleField(fieldName, fieldEl, fieldConfig);
                    };

                    for (const evt of eventNames) {
                        fieldEl.addEventListener(evt, handler);
                        listenersToClean.push(() =>
                            fieldEl.removeEventListener(evt, handler),
                        );
                    }
                } else {
                    fieldValidationState.set(fieldName, false);
                }
            }

            // Set initial form state and disable submit button if form is invalid
            const initialAllValid =
                fieldValidationState.size === Object.keys(options.fields).length &&
                Array.from(fieldValidationState.values()).every(Boolean);
            updateFormState(initialAllValid);

            // Provide validateAll method
            instance.validateAll = (): boolean => {
                let allValid = true;
                for (const [fieldName, fieldConfig] of Object.entries(options.fields)) {
                    const fieldEl = instance.fields.get(fieldName);
                    if (fieldEl) {
                        const fieldValid = validateSingleField(fieldName, fieldEl, fieldConfig);
                        if (!fieldValid) allValid = false;
                    } else {
                        allValid = false;
                    }
                }
                updateFormState(allValid);
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

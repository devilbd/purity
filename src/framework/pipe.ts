/**
 * Interface defining the contract for Purity transform pipes.
 */
export interface PipeTransform {
    transform(value: any, ...args: any[]): any;
}

/**
 * Base class for Purity transform pipes.
 */
export abstract class BasePipe implements PipeTransform {
    abstract transform(value: any, ...args: any[]): any;
}

export interface PipeOptions {
    name: string;
}

const pipeRegistry = new Map<string, any>();
const pipeInstances = new Map<string, PipeTransform>();

/**
 * Pipe decorator that registers a transform pipe class under the given name.
 * 
 * @param nameOrOptions Pipe name (e.g. 'myTransformPipe' or 'uppercase') or options object
 */
export function Pipe(nameOrOptions: string | PipeOptions): any {
    const name = typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name;

    return function <T extends abstract new (...args: any[]) => any>(
        target: T,
        context?: ClassDecoratorContext<T> | any,
    ): any {
        const pipeName = name || (context?.name ? String(context.name) : target.name);
        pipeRegistry.set(pipeName, target);
        // Invalidate cached singleton instance on re-registration
        pipeInstances.delete(pipeName);
        return target;
    };
}

/**
 * Programmatically registers a pipe class by name.
 */
export function registerPipe(name: string, pipeClass: any): void {
    pipeRegistry.set(name, pipeClass);
    pipeInstances.delete(name);
}

/**
 * Resolves a singleton instance of the registered pipe class.
 */
export function getPipe(name: string): PipeTransform | null {
    if (pipeInstances.has(name)) {
        return pipeInstances.get(name)!;
    }
    const PipeClass = pipeRegistry.get(name);
    if (!PipeClass) {
        return null;
    }
    try {
        const instance = new PipeClass();
        pipeInstances.set(name, instance);
        return instance;
    } catch (e) {
        console.error(`Failed to instantiate pipe "${name}":`, e);
        return null;
    }
}

/**
 * Executes a pipe transform function at runtime.
 */
export function executePipe(name: string, value: any, ...args: any[]): any {
    const pipe = getPipe(name);
    if (!pipe || typeof pipe.transform !== 'function') {
        console.warn(`Pipe "${name}" not found or does not implement transform(). Returning original value.`);
        return value;
    }
    try {
        return pipe.transform(value, ...args);
    } catch (error) {
        console.error(`Error executing pipe "${name}":`, error);
        return value;
    }
}

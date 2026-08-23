export type Constructor<T = any> = new (...args: any[]) => T;
export type Token<T = any> = string | symbol | Constructor<T>;

export interface InjectableOptions {
    name?: string;
    singleton?: boolean;
}

interface ServiceRegistration<T = any> {
    target: Constructor<T>;
    options: InjectableOptions;
    instance?: T;
}

class DependencyContainer {
    private registry = new Map<Token, ServiceRegistration>();
    private instances = new Map<Token, any>();

    /**
     * Registers a service constructor under a specific token.
     */
    register<T>(
        token: Token<T>,
        target: Constructor<T>,
        options: InjectableOptions = { singleton: true },
    ): void {
        this.registry.set(token, {
            target,
            options: { singleton: options.singleton ?? true, ...options },
        });
    }

    /**
     * Registers a pre-existing value or instance under a specific token.
     */
    registerValue<T>(token: Token<T>, value: T): void {
        this.instances.set(token, value);
    }

    /**
     * Resolves and returns an instance of the requested service.
     */
    resolve<T>(token: Token<T>): T {
        // If already cached as a singleton instance
        if (this.instances.has(token)) {
            return this.instances.get(token);
        }

        const registration = this.registry.get(token);

        if (!registration) {
            // If token is a constructor that hasn't been registered yet, register and instantiate it
            if (typeof token === 'function') {
                const instance = new (token as Constructor<T>)();
                this.instances.set(token, instance);
                return instance;
            }
            const tokenName = typeof token === 'symbol' ? token.toString() : String(token);
            throw new Error(`[Purity DI] No service registered with token: "${tokenName}".`);
        }

        const { target, options } = registration;
        const instance = new target();

        if (options.singleton !== false) {
            this.instances.set(token, instance);
            // Also cache under the constructor if registered by string name
            this.instances.set(target, instance);
            if (options.name) {
                this.instances.set(options.name, instance);
            }
        }

        return instance;
    }

    /**
     * Clears registered services and singleton instances (useful for testing).
     */
    clear(): void {
        this.registry.clear();
        this.instances.clear();
    }
}

/**
 * Global Dependency Injection Container
 */
export const container = new DependencyContainer();

/**
 * Decorator to register a class as an injectable service.
 * Supports:
 * - @Injectable
 * - @Injectable()
 * - @Injectable('customName')
 * - @Injectable({ name: 'customName', singleton: true })
 */
export function Injectable(
    optionsOrNameOrTarget?: string | InjectableOptions | Constructor,
    context?: any,
): any {
    if (typeof optionsOrNameOrTarget === 'function') {
        const target = optionsOrNameOrTarget;
        const serviceName =
            context && typeof context.name === 'string' ? context.name : target.name;
        if (serviceName) {
            container.register(serviceName, target, { singleton: true });
        }
        container.register(target, target, { singleton: true });
        return target;
    }

    const options: InjectableOptions =
        typeof optionsOrNameOrTarget === 'string'
            ? { name: optionsOrNameOrTarget }
            : (optionsOrNameOrTarget ?? {});

    return function <T extends Constructor>(
        target: T,
        ctx?: ClassDecoratorContext<T> | any,
    ): T | void {
        const serviceName =
            options.name ??
            (ctx && typeof ctx.name === 'string' ? ctx.name : target.name);

        if (serviceName) {
            container.register(serviceName, target, options);
        }
        container.register(target, target, options);

        return target;
    };
}

/**
 * Alias for @Injectable
 */
export const Service = Injectable;

/**
 * Injects and resolves a registered service by token (name or class constructor).
 */
export function inject<T>(token: Token<T>): T {
    return container.resolve<T>(token);
}

/**
 * Registers an existing value or instance in the DI container.
 */
export function registerValue<T>(token: Token<T>, value: T): void {
    container.registerValue(token, value);
}

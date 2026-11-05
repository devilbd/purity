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
    private resolutionStack: string[] = [];
    private serviceDependencies = new Map<string, Set<string>>();
    private serviceDependents = new Map<string, Set<string>>();
    private componentDependencies = new Map<string, Set<string>>();
    private currentComponent: string | null = null;

    private getTokenName(token: Token): string {
        if (typeof token === 'string') return token;
        if (typeof token === 'symbol') return token.description || token.toString();
        if (typeof token === 'function') return token.name || 'AnonymousService';
        return String(token);
    }

    private recordDependency(token: Token): void {
        const targetName = this.getTokenName(token);
        const currentService = this.resolutionStack[this.resolutionStack.length - 1];

        if (currentService && currentService !== targetName) {
            if (!this.serviceDependencies.has(currentService)) {
                this.serviceDependencies.set(currentService, new Set());
            }
            this.serviceDependencies.get(currentService)!.add(targetName);

            if (!this.serviceDependents.has(targetName)) {
                this.serviceDependents.set(targetName, new Set());
            }
            this.serviceDependents.get(targetName)!.add(currentService);
        }

        if (this.currentComponent) {
            if (!this.componentDependencies.has(this.currentComponent)) {
                this.componentDependencies.set(this.currentComponent, new Set());
            }
            this.componentDependencies.get(this.currentComponent)!.add(targetName);

            if (!this.serviceDependents.has(targetName)) {
                this.serviceDependents.set(targetName, new Set());
            }
            this.serviceDependents.get(targetName)!.add(this.currentComponent);
        }
    }

    /**
     * Sets the currently instantiating component name for dependency tracking.
     */
    setCurrentComponent(componentName: string | null): void {
        this.currentComponent = componentName;
    }

    /**
     * Returns services that the given service directly depends on.
     */
    getServiceDependencies(serviceName: string): string[] {
        return Array.from(this.serviceDependencies.get(serviceName) || []);
    }

    /**
     * Returns components or services that depend on the given service.
     */
    getServiceDependents(serviceName: string): string[] {
        return Array.from(this.serviceDependents.get(serviceName) || []);
    }

    /**
     * Returns services injected by a specific component.
     */
    getComponentDependencies(componentName: string): string[] {
        return Array.from(this.componentDependencies.get(componentName) || []);
    }

    /**
     * Returns all registered service names / tokens in the container.
     */
    getAllRegisteredServices(): string[] {
        const set = new Set<string>();
        for (const [token] of this.registry) {
            set.add(this.getTokenName(token));
        }
        for (const [token] of this.instances) {
            set.add(this.getTokenName(token));
        }
        return Array.from(set);
    }

    /**
     * Returns an active instance of a service if already instantiated.
     */
    getServiceInstance(serviceName: string): any {
        return this.instances.get(serviceName) ?? null;
    }

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
        this.recordDependency(token);

        // If already cached as a singleton instance
        if (this.instances.has(token)) {
            return this.instances.get(token);
        }

        const registration = this.registry.get(token);
        const targetName = this.getTokenName(token);

        this.resolutionStack.push(targetName);
        try {
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
        } finally {
            this.resolutionStack.pop();
        }
    }

    /**
     * Clears registered services and singleton instances (useful for testing).
     */
    clear(): void {
        this.registry.clear();
        this.instances.clear();
        this.resolutionStack = [];
        this.serviceDependencies.clear();
        this.serviceDependents.clear();
        this.componentDependencies.clear();
        this.currentComponent = null;
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

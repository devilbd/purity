import { describe, it, expect, beforeEach } from 'vitest';
import { Component } from './component';
import { Injectable, inject, container } from './di';
import { signal, computed, effect } from './core';
import { getComponentsInspection, getServicesInspection, inspectPurityApp, createDevTools } from './devtools';

@Injectable('TestLoggerService')
class TestLoggerService {
    public logs = signal<string[]>([]);
}

@Injectable('TestDataService')
class TestDataService {
    public logger = inject(TestLoggerService);
    public itemsCount = signal(5);
}

@Component({
    selector: 'test-inspector-child',
    template: '<span>{{ title() }}</span>',
})
export class TestInspectorChildComponent {
    public dataService = inject(TestDataService);
    public title = signal('Child Inspector');
    public doubledCount = computed(() => this.dataService.itemsCount() * 2);

    protected onInit() {
        effect(() => {
            // Trigger effect
            this.title();
        });
    }
}

describe('Purity DevTools Inspector', () => {
    beforeEach(() => {
        container.clear();
        document.body.innerHTML = '';
    });

    it('should track service dependencies and dependents in DI container', () => {
        container.register('TestLoggerService', TestLoggerService);
        container.register('TestDataService', TestDataService);

        const dataService = container.resolve<TestDataService>('TestDataService');
        expect(dataService).toBeInstanceOf(TestDataService);

        const deps = container.getServiceDependencies('TestDataService');
        expect(deps).toContain('TestLoggerService');

        const dependents = container.getServiceDependents('TestLoggerService');
        expect(dependents).toContain('TestDataService');
    });

    it('should inspect services with their signals and dependencies', () => {
        container.register('TestLoggerService', TestLoggerService);
        container.register('TestDataService', TestDataService);
        container.resolve('TestDataService');

        const services = getServicesInspection();
        const dataServiceInfo = services.find((s) => s.name === 'TestDataService');

        expect(dataServiceInfo).toBeDefined();
        expect(dataServiceInfo?.dependencies).toContain('TestLoggerService');
        expect(dataServiceInfo?.signals.some((sig) => sig.name === 'itemsCount')).toBe(true);
    });

    it('should inspect components, their injected services, signals, and effects', () => {
        container.register('TestLoggerService', TestLoggerService);
        container.register('TestDataService', TestDataService);

        const el = document.createElement('test-inspector-child');
        document.body.appendChild(el);

        const components = getComponentsInspection();
        const comp = components.find((c) => c.name === 'TestInspectorChildComponent');

        expect(comp).toBeDefined();
        expect(comp?.elementCount).toBe(1);
        expect(comp?.services.some((s) => s.name === 'TestDataService')).toBe(true);

        // Signals check
        const titleSignal = comp?.signals.find((s) => s.name === 'title');
        expect(titleSignal).toBeDefined();
        expect(titleSignal?.type).toBe('signal');
        expect(titleSignal?.value).toBe('Child Inspector');

        const computedSignal = comp?.signals.find((s) => s.name === 'doubledCount');
        expect(computedSignal).toBeDefined();
        expect(computedSignal?.type).toBe('computed');
        expect(computedSignal?.value).toBe(10);

        // Effects check (template interpolation effect + onInit effect)
        expect(comp?.effects.length).toBeGreaterThan(0);
    });

    it('should return a complete snapshot from inspectPurityApp()', () => {
        const snapshot = inspectPurityApp();
        expect(snapshot.detected).toBe(true);
        expect(snapshot.framework).toBe('Purity');
        expect(snapshot.version).toBe('2.0.2');
        expect(Array.isArray(snapshot.components)).toBe(true);
        expect(Array.isArray(snapshot.services)).toBe(true);
    });

    it('should measure component render metrics and manage recording sessions', () => {
        const el = document.createElement('test-inspector-child');
        document.body.appendChild(el);

        const components = getComponentsInspection();
        const comp = components.find((c) => c.name === 'TestInspectorChildComponent');
        expect(comp?.metrics).toBeDefined();
        expect(typeof comp?.metrics?.initialRenderTimeMs).toBe('number');
        expect(typeof comp?.metrics?.renderCount).toBe('number');

        // Test start recording
        const session = createDevTools().startRecording('TestInspectorChildComponent');
        expect(session.isActive).toBe(true);
        expect(session.componentName).toBe('TestInspectorChildComponent');

        // Test stop recording
        const finished = createDevTools().stopRecording();
        expect(finished?.isActive).toBe(false);
        expect(typeof finished?.totalDurationMs).toBe('number');
    });
});

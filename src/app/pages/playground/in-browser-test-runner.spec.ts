import { describe, it, expect } from 'vitest';
import {
    createExpect,
    createMockFunction,
    runPlaygroundTests,
} from './in-browser-test-runner';
import { compileUserComponent } from './playground.component';
import * as purityCore from '@purity/core';

describe('In-Browser Test Runner Engine', () => {
    describe('createExpect assertions', () => {
        it('should pass toBe and toEqual checks', () => {
            expect(() => createExpect(5).toBe(5)).not.toThrow();
            expect(() => createExpect(5).toBe(10)).toThrow();

            expect(() => createExpect({ a: 1 }).toEqual({ a: 1 })).not.toThrow();
            expect(() => createExpect({ a: 1 }).toEqual({ a: 2 })).toThrow();
        });

        it('should support truthy/falsy/null/undefined checks', () => {
            expect(() => createExpect(true).toBeTruthy()).not.toThrow();
            expect(() => createExpect(false).toBeFalsy()).not.toThrow();
            expect(() => createExpect(null).toBeNull()).not.toThrow();
            expect(() => createExpect(undefined).toBeUndefined()).not.toThrow();
            expect(() => createExpect('hello').toBeDefined()).not.toThrow();
        });

        it('should support toContain and toHaveLength', () => {
            expect(() => createExpect([1, 2, 3]).toContain(2)).not.toThrow();
            expect(() => createExpect('hello world').toContain('world')).not.toThrow();
            expect(() => createExpect([1, 2, 3]).toHaveLength(3)).not.toThrow();
        });

        it('should support .not negation', () => {
            expect(() => createExpect(5).not.toBe(10)).not.toThrow();
            expect(() => createExpect(false).not.toBeTruthy()).not.toThrow();
            expect(() => createExpect([1, 2]).not.toContain(5)).not.toThrow();
        });
    });

    describe('createMockFunction (vi.fn)', () => {
        it('should record calls and arguments', () => {
            const mock = createMockFunction((x: number) => x * 2);
            expect(mock(3)).toBe(6);
            expect(mock(4)).toBe(8);

            expect(mock.calls.length).toBe(2);
            expect(mock.calls[0]).toEqual([3]);
            expect(mock.calls[1]).toEqual([4]);

            createExpect(mock).toHaveBeenCalled();
            createExpect(mock).toHaveBeenCalledTimes(2);
            createExpect(mock).toHaveBeenCalledWith(3);
        });

        it('should support mockReturnValue', () => {
            const mock = createMockFunction().mockReturnValue(42);
            expect(mock()).toBe(42);
        });
    });

    describe('runPlaygroundTests', () => {
        it('should run passing test suite', async () => {
            const specCode = `
                describe('Sample Suite', () => {
                    it('should assert true', () => {
                        expect(1 + 1).toBe(2);
                    });

                    it('should check array', () => {
                        expect(['a', 'b']).toContain('a');
                    });
                });
            `;

            const summary = await runPlaygroundTests(specCode, {});
            expect(summary.status).toBe('passed');
            expect(summary.totalTests).toBe(2);
            expect(summary.passedCount).toBe(2);
            expect(summary.failedCount).toBe(0);
            expect(summary.suites.length).toBe(1);
            expect(summary.suites[0].name).toBe('Sample Suite');
        });

        it('should handle async tests and captures failures', async () => {
            const specCode = `
                describe('Async Suite', () => {
                    it('should succeed asynchronously', async () => {
                        const val = await Promise.resolve(10);
                        expect(val).toBe(10);
                    });

                    it('should fail with expected error', () => {
                        expect('apple').toBe('orange');
                    });
                });
            `;

            const summary = await runPlaygroundTests(specCode, {});
            expect(summary.status).toBe('failed');
            expect(summary.totalTests).toBe(2);
            expect(summary.passedCount).toBe(1);
            expect(summary.failedCount).toBe(1);
            expect(summary.suites[0].tests[1].status).toBe('failed');
            expect(summary.suites[0].tests[1].error?.message).toContain('Expected to be "orange"');
        });

        it('should execute beforeEach and afterEach hooks', async () => {
            const specCode = `
                describe('Lifecycle Suite', () => {
                    let counter = 0;

                    beforeEach(() => {
                        counter += 5;
                    });

                    afterEach(() => {
                        counter = 0;
                    });

                    it('first test', () => {
                        expect(counter).toBe(5);
                    });

                    it('second test', () => {
                        expect(counter).toBe(5);
                    });
                });
            `;

            const summary = await runPlaygroundTests(specCode, {});
            expect(summary.status).toBe('passed');
            expect(summary.totalTests).toBe(2);
            expect(summary.passedCount).toBe(2);
        });

        it('should handle syntax/compilation errors gracefully', async () => {
            const brokenCode = `describe('Broken', () => { invalid syntax !! }}});`;
            const summary = await runPlaygroundTests(brokenCode, {});
            expect(summary.status).toBe('failed');
            expect(summary.failedCount).toBe(1);
        });
    });

    describe('Live Component Compilation & Test Execution', () => {
        it('should execute tests against user-defined component class', async () => {
            const userTs = `
                import { Component, signal } from '@purity/core';

                @Component({ selector: 'test-comp' })
                export class PlaygroundDemoComponent {
                    count = signal(0);
                    increment() {
                        this.count.update(n => n + 1);
                    }
                }
            `;

            const compiled = compileUserComponent(userTs, '<div></div>', 1, { ...purityCore });
            const testScope = { ...purityCore, ...compiled.exports };

            const specCode = `
                describe('Counter Test', () => {
                    it('should increment count on component instance', () => {
                        const comp = new PlaygroundDemoComponent();
                        expect(comp.count()).toBe(0);
                        comp.increment();
                        expect(comp.count()).toBe(1);
                    });
                });
            `;

            const summary = await runPlaygroundTests(specCode, testScope);
            expect(summary.status).toBe('passed');
            expect(summary.passedCount).toBe(1);
            expect(summary.failedCount).toBe(0);
        });

        it('should fail test when user code is missing a required method', async () => {
            // User deleted increment() from their component
            const userTsWithDeletedCode = `
                import { Component, signal } from '@purity/core';

                @Component({ selector: 'test-comp' })
                export class PlaygroundDemoComponent {
                    count = signal(0);
                    // increment() method is missing!
                }
            `;

            const compiled = compileUserComponent(userTsWithDeletedCode, '<div></div>', 2, { ...purityCore });
            const testScope = { ...purityCore, ...compiled.exports };

            const specCode = `
                describe('Counter Test', () => {
                    it('should increment count on component instance', () => {
                        const comp = new PlaygroundDemoComponent();
                        comp.increment(); // Should throw TypeError because it was deleted
                        expect(comp.count()).toBe(1);
                    });
                });
            `;

            const summary = await runPlaygroundTests(specCode, testScope);
            expect(summary.status).toBe('failed');
            expect(summary.failedCount).toBe(1);
            expect(summary.suites[0].tests[0].error?.message).toContain('comp.increment is not a function');
        });

        it('should fail when user deletes the component class completely', async () => {
            // User deleted the class
            const emptyUserTs = `
                // No component class here anymore!
                const hello = 'world';
            `;

            const compiled = compileUserComponent(emptyUserTs, '<div></div>', 3, { ...purityCore });
            const testScope = { ...purityCore, ...compiled.exports };

            const specCode = `
                describe('Component Exists', () => {
                    it('should find component class', () => {
                        expect(typeof PlaygroundDemoComponent).not.toBe('undefined');
                    });
                });
            `;

            const summary = await runPlaygroundTests(specCode, testScope);
            expect(summary.status).toBe('failed');
            expect(summary.failedCount).toBe(1);
        });
    });
});

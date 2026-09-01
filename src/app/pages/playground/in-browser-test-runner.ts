import { transform } from 'sucrase';

export type TestStatus = 'passed' | 'failed' | 'running';

export interface TestCaseResult {
    name: string;
    status: TestStatus;
    durationMs: number;
    error?: {
        message: string;
        expected?: any;
        received?: any;
        stack?: string;
    };
}

export interface TestSuiteResult {
    name: string;
    tests: TestCaseResult[];
    passedCount: number;
    failedCount: number;
    durationMs: number;
}

export interface TestRunSummary {
    suites: TestSuiteResult[];
    totalTests: number;
    passedCount: number;
    failedCount: number;
    totalDurationMs: number;
    status: TestStatus;
    timestamp: number;
}

export interface MockFunction<T extends (...args: any[]) => any = any> {
    (...args: Parameters<T>): ReturnType<T>;
    calls: Parameters<T>[];
    results: ReturnType<T>[];
    mockReturnValue(val: ReturnType<T>): MockFunction<T>;
    mockImplementation(fn: T): MockFunction<T>;
}

export function createMockFunction<T extends (...args: any[]) => any>(implementation?: T): MockFunction<T> {
    let currentImpl = implementation;
    const calls: Parameters<T>[] = [];
    const results: ReturnType<T>[] = [];

    const mock = function (this: any, ...args: Parameters<T>): ReturnType<T> {
        calls.push(args);
        let result: any;
        if (currentImpl) {
            result = currentImpl.apply(this, args);
        }
        results.push(result);
        return result;
    } as MockFunction<T>;

    mock.calls = calls;
    mock.results = results;
    mock.mockReturnValue = (val: ReturnType<T>) => {
        currentImpl = (() => val) as unknown as T;
        return mock;
    };
    mock.mockImplementation = (fn: T) => {
        currentImpl = fn;
        return mock;
    };

    return mock;
}

function deepEqual(a: any, b: any): boolean {
    if (Object.is(a, b)) return true;
    if (a === null || typeof a !== 'object' || b === null || typeof b !== 'object') {
        return false;
    }
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
            return false;
        }
    }
    return true;
}

function formatValue(val: any): string {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val}"`;
    if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
    if (typeof val === 'object') {
        try {
            return JSON.stringify(val);
        } catch {
            return String(val);
        }
    }
    return String(val);
}

export function createExpect(actual: any, isNot = false) {
    const formatDiff = (expected: any, message: string) => {
        const err: any = new Error(message);
        err.expected = formatValue(expected);
        err.received = formatValue(actual);
        return err;
    };

    const assertions = {
        get not() {
            return createExpect(actual, !isNot);
        },

        toBe(expected: any) {
            const pass = Object.is(actual, expected);
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'not to be' : 'to be';
                throw formatDiff(expected, `Expected ${verb} ${formatValue(expected)}, but received ${formatValue(actual)}`);
            }
        },

        toEqual(expected: any) {
            const pass = deepEqual(actual, expected);
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'not to equal' : 'to equal';
                throw formatDiff(expected, `Expected ${verb} ${formatValue(expected)}, but received ${formatValue(actual)}`);
            }
        },

        toBeTruthy() {
            const pass = Boolean(actual);
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'falsy' : 'truthy';
                throw formatDiff(isNot ? 'falsy' : 'truthy', `Expected value to be ${verb}, but received ${formatValue(actual)}`);
            }
        },

        toBeFalsy() {
            const pass = !actual;
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'truthy' : 'falsy';
                throw formatDiff(isNot ? 'truthy' : 'falsy', `Expected value to be ${verb}, but received ${formatValue(actual)}`);
            }
        },

        toBeNull() {
            const pass = actual === null;
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'not null' : 'null';
                throw formatDiff('null', `Expected value to be ${verb}, but received ${formatValue(actual)}`);
            }
        },

        toBeUndefined() {
            const pass = actual === undefined;
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'defined' : 'undefined';
                throw formatDiff('undefined', `Expected value to be ${verb}, but received ${formatValue(actual)}`);
            }
        },

        toBeDefined() {
            const pass = actual !== undefined;
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'undefined' : 'defined';
                throw formatDiff('defined', `Expected value to be ${verb}, but received ${formatValue(actual)}`);
            }
        },

        toContain(item: any) {
            let pass = false;
            if (typeof actual === 'string' || Array.isArray(actual)) {
                pass = actual.includes(item);
            } else if (actual instanceof Set || actual instanceof Map) {
                pass = actual.has(item);
            }
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'not to contain' : 'to contain';
                throw formatDiff(item, `Expected collection ${verb} ${formatValue(item)}, but received ${formatValue(actual)}`);
            }
        },

        toHaveLength(expectedLength: number) {
            const length = actual?.length ?? actual?.size;
            const pass = length === expectedLength;
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'not to have length' : 'to have length';
                throw formatDiff(expectedLength, `Expected collection ${verb} ${expectedLength}, but received length ${length}`);
            }
        },

        toHaveBeenCalled() {
            const calls = (actual as MockFunction)?.calls;
            if (!calls) {
                throw new Error('Expected a mock function to have been called, but received non-mock object');
            }
            const pass = calls.length > 0;
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'not to have been called' : 'to have been called';
                throw formatDiff(isNot ? 0 : 1, `Expected mock function ${verb}, but was called ${calls.length} times`);
            }
        },

        toHaveBeenCalledTimes(expectedCount: number) {
            const calls = (actual as MockFunction)?.calls;
            if (!calls) {
                throw new Error('Expected a mock function, but received non-mock object');
            }
            const pass = calls.length === expectedCount;
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'not to have been called' : 'to have been called';
                throw formatDiff(expectedCount, `Expected mock function ${verb} ${expectedCount} times, but was called ${calls.length} times`);
            }
        },

        toHaveBeenCalledWith(...expectedArgs: any[]) {
            const calls = (actual as MockFunction)?.calls;
            if (!calls) {
                throw new Error('Expected a mock function, but received non-mock object');
            }
            const pass = calls.some((args) => deepEqual(args, expectedArgs));
            if (isNot ? pass : !pass) {
                const verb = isNot ? 'not to have been called with' : 'to have been called with';
                throw formatDiff(expectedArgs, `Expected mock function ${verb} ${formatValue(expectedArgs)}, but was called with ${formatValue(calls)}`);
            }
        },
    };

    return assertions;
}

export async function runPlaygroundTests(
    specCode: string,
    sandboxScope: Record<string, any>,
): Promise<TestRunSummary> {
    const startTime = performance.now();
    const suiteDefinitions: Array<{
        name: string;
        beforeEachFns: Array<() => any>;
        afterEachFns: Array<() => any>;
        testFns: Array<{ name: string; fn: () => any }>;
    }> = [];

    let currentSuite: {
        name: string;
        beforeEachFns: Array<() => any>;
        afterEachFns: Array<() => any>;
        testFns: Array<{ name: string; fn: () => any }>;
    } = {
        name: 'Default Test Suite',
        beforeEachFns: [],
        afterEachFns: [],
        testFns: [],
    };

    const describe = (name: string, fn: () => void) => {
        const prevSuite = currentSuite;
        const newSuite = {
            name,
            beforeEachFns: [...prevSuite.beforeEachFns],
            afterEachFns: [...prevSuite.afterEachFns],
            testFns: [],
        };
        currentSuite = newSuite;
        try {
            fn();
        } finally {
            if (newSuite.testFns.length > 0) {
                suiteDefinitions.push(newSuite);
            }
            currentSuite = prevSuite;
        }
    };

    const it = (name: string, fn: () => any) => {
        currentSuite.testFns.push({ name, fn });
    };

    const test = it;

    const beforeEach = (fn: () => any) => {
        currentSuite.beforeEachFns.push(fn);
    };

    const afterEach = (fn: () => any) => {
        currentSuite.afterEachFns.push(fn);
    };

    const vi = {
        fn: createMockFunction,
    };

    const expect = createExpect;

    let cleanJs = '';
    try {
        // Transpile TS spec code with Sucrase
        const transformed = transform(specCode, {
            transforms: ['typescript'],
            disableESTransforms: true,
        });
        cleanJs = transformed.code;

        // Strip import statements
        cleanJs = cleanJs
            .replace(/import\s+(?:type\s+)?[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
            .replace(/import\s+['"][^'"]+['"];?/g, '')
            .replace(/import\s+type\s+[^;]+;?/g, '')
            .replace(/export\s+(?:default\s+)?/g, '');

        const testEnvScope = {
            ...sandboxScope,
            describe,
            it,
            test,
            beforeEach,
            afterEach,
            expect,
            vi,
        };

        const scopeKeys = Object.keys(testEnvScope);
        const runnerFn = new Function('__env', `
            const { ${scopeKeys.join(', ')} } = __env;
            ${cleanJs}
        `);

        runnerFn(testEnvScope);
    } catch (parseErr: any) {
        const errorResult: TestSuiteResult = {
            name: 'Syntax / Compilation Error',
            tests: [
                {
                    name: 'Test Execution Setup',
                    status: 'failed',
                    durationMs: 0,
                    error: {
                        message: parseErr?.message || String(parseErr),
                        stack: parseErr?.stack,
                    },
                },
            ],
            passedCount: 0,
            failedCount: 1,
            durationMs: Math.round(performance.now() - startTime),
        };

        return {
            suites: [errorResult],
            totalTests: 1,
            passedCount: 0,
            failedCount: 1,
            totalDurationMs: Math.round(performance.now() - startTime),
            status: 'failed',
            timestamp: Date.now(),
        };
    }

    // If no describe blocks were used but it/test were called directly
    if (currentSuite.testFns.length > 0 && !suiteDefinitions.includes(currentSuite)) {
        suiteDefinitions.push(currentSuite);
    }

    const suiteResults: TestSuiteResult[] = [];
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const suite of suiteDefinitions) {
        const suiteStartTime = performance.now();
        const testResults: TestCaseResult[] = [];
        let suitePassed = 0;
        let suiteFailed = 0;

        for (const testItem of suite.testFns) {
            const testStart = performance.now();
            let testStatus: TestStatus = 'passed';
            let testError: any = undefined;

            try {
                // Run beforeEach hooks
                for (const hook of suite.beforeEachFns) {
                    await hook();
                }

                // Run test
                await testItem.fn();

                suitePassed++;
                totalPassed++;
            } catch (err: any) {
                testStatus = 'failed';
                suiteFailed++;
                totalFailed++;
                testError = {
                    message: err?.message || String(err),
                    expected: err?.expected,
                    received: err?.received,
                    stack: err?.stack,
                };
            } finally {
                // Run afterEach hooks
                for (const hook of suite.afterEachFns) {
                    try {
                        await hook();
                    } catch (hookErr) {
                        console.warn('[Playground Tests] Error in afterEach hook:', hookErr);
                    }
                }
            }

            const durationMs = Math.max(1, Math.round(performance.now() - testStart));
            testResults.push({
                name: testItem.name,
                status: testStatus,
                durationMs,
                error: testError,
            });
            totalTests++;
        }

        suiteResults.push({
            name: suite.name,
            tests: testResults,
            passedCount: suitePassed,
            failedCount: suiteFailed,
            durationMs: Math.max(1, Math.round(performance.now() - suiteStartTime)),
        });
    }

    const totalDurationMs = Math.max(1, Math.round(performance.now() - startTime));

    return {
        suites: suiteResults,
        totalTests,
        passedCount: totalPassed,
        failedCount: totalFailed,
        totalDurationMs,
        status: totalFailed > 0 ? 'failed' : 'passed',
        timestamp: Date.now(),
    };
}

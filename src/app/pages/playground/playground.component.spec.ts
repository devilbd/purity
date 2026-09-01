import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlaygroundComponent } from './playground.component';
import { PLAYGROUND_PRESETS } from './playground-presets';

describe('PlaygroundComponent - Preset Persistence & Uniqueness', () => {
    let playground: PlaygroundComponent;
    let mockStorage: Record<string, string>;
    let promptMock: any;

    beforeEach(() => {
        mockStorage = {};
        // Mock localStorage
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key: string) => mockStorage[key] || null),
            setItem: vi.fn((key: string, val: string) => {
                mockStorage[key] = val;
            }),
            removeItem: vi.fn((key: string) => {
                delete mockStorage[key];
            }),
            clear: vi.fn(() => {
                mockStorage = {};
            }),
        });

        promptMock = vi.fn();
        window.prompt = promptMock;
        vi.stubGlobal('prompt', promptMock);

        playground = new PlaygroundComponent();
    });

    it('should initialize with default built-in presets', () => {
        expect(playground.allPresets.length).toBeGreaterThanOrEqual(PLAYGROUND_PRESETS.length);
        expect(playground.selectedPresetId()).toBe(PLAYGROUND_PRESETS[0].id);
        expect(playground.isCustomSelected).toBe(false);
    });

    it('should save a new custom preset when given a unique name', () => {
        promptMock.mockReturnValue('My Custom Widget');

        playground.tsCode.set('export class CustomTest {}');
        playground.htmlCode.set('<div>Test</div>');
        playground.onSaveSnippet();

        expect(playground.savedPresets()).toHaveLength(1);
        expect(playground.savedPresets()[0].name).toBe('💾 My Custom Widget');
        expect(playground.savedPresets()[0].ts).toBe('export class CustomTest {}');
        expect(playground.selectedPresetId()).toBe(playground.savedPresets()[0].id);
        expect(playground.isCustomSelected).toBe(true);
    });

    it('should override existing custom preset if saved with the same name', () => {
        // First save
        promptMock.mockReturnValue('My Custom Widget');
        playground.tsCode.set('export class V1 {}');
        playground.onSaveSnippet();

        expect(playground.savedPresets()).toHaveLength(1);
        const originalId = playground.savedPresets()[0].id;
        expect(playground.savedPresets()[0].ts).toBe('export class V1 {}');

        // Second save with the same name -> should override V1 without duplicating
        playground.tsCode.set('export class V2_Updated {}');
        playground.onSaveSnippet();

        expect(playground.savedPresets()).toHaveLength(1);
        expect(playground.savedPresets()[0].id).toBe(originalId);
        expect(playground.savedPresets()[0].name).toBe('💾 My Custom Widget');
        expect(playground.savedPresets()[0].ts).toBe('export class V2_Updated {}');
    });

    it('should override existing custom preset even if prefixed with 💾 emoji or case-insensitive', () => {
        promptMock.mockReturnValue('Dashboard View');
        playground.tsCode.set('export class Initial {}');
        playground.onSaveSnippet();

        expect(playground.savedPresets()).toHaveLength(1);

        // Prompt with '💾 dashboard view'
        promptMock.mockReturnValue('💾 dashboard view');
        playground.tsCode.set('export class Overridden {}');
        playground.onSaveSnippet();

        // Must still have only 1 preset in savedPresets list
        expect(playground.savedPresets()).toHaveLength(1);
        expect(playground.savedPresets()[0].ts).toBe('export class Overridden {}');
    });

    it('should NOT allow overriding default built-in presets', () => {
        const initialCustomCount = playground.savedPresets().length;

        // Try to save with name matching default preset (e.g. 'Empty Starter')
        promptMock.mockReturnValue('Empty Starter');
        playground.onSaveSnippet();

        // Custom presets list should not increase, and built-in preset remains untouched
        expect(playground.savedPresets().length).toBe(initialCustomCount);

        // Try with exact built-in name with emoji (e.g. '✨ Empty Starter')
        promptMock.mockReturnValue('✨ Empty Starter');
        playground.onSaveSnippet();
        expect(playground.savedPresets().length).toBe(initialCustomCount);

        // Try with preset id (e.g. 'counter')
        promptMock.mockReturnValue('counter');
        playground.onSaveSnippet();
        expect(playground.savedPresets().length).toBe(initialCustomCount);
    });

    it('should delete custom preset and revert selection to default preset', () => {
        promptMock.mockReturnValue('Temporary Draft');
        playground.onSaveSnippet();

        expect(playground.savedPresets()).toHaveLength(1);
        const customId = playground.savedPresets()[0].id;
        expect(playground.selectedPresetId()).toBe(customId);

        // Delete custom preset
        playground.onDeleteSnippet();
        expect(playground.savedPresets()).toHaveLength(0);
        expect(playground.selectedPresetId()).toBe(PLAYGROUND_PRESETS[0].id);
    });

    it('should NOT delete built-in presets', () => {
        playground.selectedPresetId.set(PLAYGROUND_PRESETS[0].id);
        const prevPresets = [...playground.allPresets];

        playground.onDeleteSnippet();

        expect(playground.allPresets).toEqual(prevPresets);
    });
});

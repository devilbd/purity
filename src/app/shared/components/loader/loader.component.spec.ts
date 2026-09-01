import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoaderComponent } from './loader.component';
import * as core from '@purity/core';

describe('LoaderComponent', () => {
    let loader: LoaderComponent;
    let element: HTMLElement;

    beforeEach(() => {
        element = document.createElement('loader-component');
        document.body.appendChild(element);
        loader = element as unknown as LoaderComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    it('should initialize with default values', () => {
        expect(loader.isLoading()).toBe(false);
        expect(loader.message()).toBe('Loading...');
    });

    it('should show loader with default message', () => {
        loader.show();
        expect(loader.isLoading()).toBe(true);
        expect(loader.message()).toBe('Loading...');
    });

    it('should show loader with custom message', () => {
        loader.show('Fetching records...');
        expect(loader.isLoading()).toBe(true);
        expect(loader.message()).toBe('Fetching records...');
    });

    it('should hide loader', () => {
        loader.show('Loading...');
        expect(loader.isLoading()).toBe(true);

        loader.hide();
        expect(loader.isLoading()).toBe(false);
    });

    it('should toggle visibility without arguments', () => {
        expect(loader.isLoading()).toBe(false);

        loader.toggle();
        expect(loader.isLoading()).toBe(true);
        expect(loader.message()).toBe('Loading...');

        loader.toggle();
        expect(loader.isLoading()).toBe(false);
    });

    it('should toggle visibility with explicit boolean and custom message', () => {
        loader.toggle(true, 'Processing data...');
        expect(loader.isLoading()).toBe(true);
        expect(loader.message()).toBe('Processing data...');

        loader.toggle(false, 'Idle');
        expect(loader.isLoading()).toBe(false);
        expect(loader.message()).toBe('Idle');
    });

    it('should manage cursor and cleanup properly on destroy', () => {
        const stopCursorSpy = vi.spyOn(core, 'stopLoadingCursor');
        const startCursorSpy = vi.spyOn(core, 'startLoadingCursor');

        loader.show('Working...');
        expect(loader.isLoading()).toBe(true);

        // When destroyed while loading, it should stop the loading cursor
        (loader as any).onDestroy();
        expect(stopCursorSpy).toHaveBeenCalled();

        stopCursorSpy.mockRestore();
        startCursorSpy.mockRestore();
    });
});

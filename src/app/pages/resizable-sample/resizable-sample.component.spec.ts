import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './resizable-sample.component';
import { ResizableSampleComponent } from './resizable-sample.component';

describe('ResizableSampleComponent', () => {
    let element: HTMLElement;
    let sample: ResizableSampleComponent;

    beforeEach(() => {
        element = document.createElement('resizable-sample');
        document.body.appendChild(element);
        sample = element as unknown as ResizableSampleComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    it('mounts resizable-sample and initializes default dimensions', () => {
        expect(element).toBeDefined();
        expect(sample).toBeDefined();
        expect(sample.currentWidth()).toBe(360);
        expect(sample.currentHeight()).toBe(200);
        expect(sample.activeHandle()).toBe('none');

        const box = element.querySelector('#resizable-demo-box');
        expect(box).not.toBeNull();
        expect(box?.classList.contains('resizable-container')).toBe(true);

        const cornerHandles = box?.querySelectorAll('.resize-handle-corner');
        expect(cornerHandles?.length).toBe(4);
    });

    it('applies preset dimensions and updates signals', () => {
        sample.setPreset(480, 260);
        expect(sample.currentWidth()).toBe(480);
        expect(sample.currentHeight()).toBe(260);
        expect(sample.lastAction()).toContain('480×260');

        const box = element.querySelector('#resizable-demo-box') as HTMLElement;
        expect(box.style.width).toBe('480px');
        expect(box.style.height).toBe('260px');
    });

    it('resets dimensions back to default 360x200', () => {
        sample.setPreset(240, 140);
        expect(sample.currentWidth()).toBe(240);

        sample.resetDimensions();
        expect(sample.currentWidth()).toBe(360);
        expect(sample.currentHeight()).toBe(200);
        expect(sample.lastAction()).toContain('Reset dimensions');
    });

    it('toggles aspect ratio lock signal and re-initializes resizers', () => {
        expect(sample.isAspectLocked()).toBe(false);

        sample.toggleAspectRatio();
        expect(sample.isAspectLocked()).toBe(true);
        expect(sample.lastAction()).toContain('locked');

        sample.toggleAspectRatio();
        expect(sample.isAspectLocked()).toBe(false);
    });

    it('toggles snap grid signal and re-initializes resizers', () => {
        expect(sample.isSnapActive()).toBe(false);

        sample.toggleSnap();
        expect(sample.isSnapActive()).toBe(true);
        expect(sample.lastAction()).toContain('enabled');

        sample.toggleSnap();
        expect(sample.isSnapActive()).toBe(false);
    });
});

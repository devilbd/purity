import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resizable, resize, resizableAll } from './resizable';

describe('Resizable Behavior', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        container.style.width = '200px';
        container.style.height = '150px';
        container.style.position = 'absolute';
        container.style.left = '50px';
        container.style.top = '40px';
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
        document.body.className = '';
        document.body.style.cursor = '';
    });

    it('initializes resizable container with 4 default corner handles', () => {
        const instance = resizable('#test-container');

        expect(container.classList.contains('resizable-container')).toBe(true);
        expect(container.getAttribute('data-purity-resizable')).toBe('true');

        const nw = container.querySelector('.resize-handle-nw');
        const ne = container.querySelector('.resize-handle-ne');
        const se = container.querySelector('.resize-handle-se');
        const sw = container.querySelector('.resize-handle-sw');

        expect(nw).not.toBeNull();
        expect(ne).not.toBeNull();
        expect(se).not.toBeNull();
        expect(sw).not.toBeNull();
        expect(nw?.classList.contains('resize-handle-corner')).toBe(true);
        expect(se?.getAttribute('data-handle')).toBe('se');

        instance.destroy();
    });

    it('returns a safe no-op instance when element is not found', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const instance = resizable('#non-existent-element');

        expect(instance.element).toBeNull();
        expect(instance.isResizing).toBe(false);
        expect(instance.isEnabled).toBe(false);
        expect(instance.getDimensions()).toEqual({ width: 0, height: 0 });

        // Methods should not throw
        instance.setDimensions(100, 100);
        instance.enable();
        instance.disable();
        instance.destroy();

        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('supports direct HTMLElement argument and resize alias', () => {
        const instance = resize(container);
        expect(container.classList.contains('resizable-container')).toBe(true);
        expect(container.querySelectorAll('.resize-handle-corner').length).toBe(4);
        instance.destroy();
        expect(container.classList.contains('resizable-container')).toBe(false);
    });

    it('supports options object with selector and target', () => {
        const instance = resizable({ selector: '#test-container' });
        expect(container.classList.contains('resizable-container')).toBe(true);
        instance.destroy();

        const instance2 = resizable({ target: container });
        expect(container.classList.contains('resizable-container')).toBe(true);
        instance2.destroy();
    });

    it('sets position: relative on static containers and restores it on destroy', () => {
        const staticBox = document.createElement('div');
        staticBox.id = 'static-box';
        document.body.appendChild(staticBox);

        const instance = resizable(staticBox);
        expect(staticBox.style.position).toBe('relative');

        instance.destroy();
        expect(staticBox.style.position).toBe('');
        staticBox.remove();
    });

    it('supports customizable handle configurations (edges, all, specific array)', () => {
        // Edges only
        const edgesInstance = resizable(container, { handles: 'edges' });
        expect(container.querySelector('.resize-handle-nw')).toBeNull();
        expect(container.querySelector('.resize-handle-n')).not.toBeNull();
        expect(container.querySelector('.resize-handle-s')).not.toBeNull();
        expect(container.querySelector('.resize-handle-e')).not.toBeNull();
        expect(container.querySelector('.resize-handle-w')).not.toBeNull();
        edgesInstance.destroy();

        // All 8 handles
        const allInstance = resizable(container, { handles: 'all' });
        expect(container.querySelectorAll('.resize-handle').length).toBe(8);
        allInstance.destroy();

        // Normalized alias array
        const customInstance = resizable(container, {
            handles: ['bottom-right', 'top-left'] as any,
        });
        expect(container.querySelector('.resize-handle-se')).not.toBeNull();
        expect(container.querySelector('.resize-handle-nw')).not.toBeNull();
        expect(container.querySelector('.resize-handle-ne')).toBeNull();
        customInstance.destroy();
    });

    it('reuses existing handle markup without injecting duplicates', () => {
        const customHandle = document.createElement('div');
        customHandle.className = 'resize-handle resize-handle-se custom-class';
        container.appendChild(customHandle);

        const instance = resizable(container);
        const seHandles = container.querySelectorAll('.resize-handle-se');
        expect(seHandles.length).toBe(1);
        expect(seHandles[0].classList.contains('custom-class')).toBe(true);

        instance.destroy();
        // Custom pre-existing handle remains intact
        expect(container.contains(customHandle)).toBe(true);
    });

    it('resizes container via bottom-right (se) corner', () => {
        const onResizeStart = vi.fn();
        const onResize = vi.fn();
        const onResizeEnd = vi.fn();

        const instance = resizable(container, {
            onResizeStart,
            onResize,
            onResizeEnd,
        });

        const handleSe = container.querySelector('.resize-handle-se') as HTMLElement;
        expect(handleSe).not.toBeNull();

        // Pointer down
        handleSe.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                clientX: 250,
                clientY: 190,
                button: 0,
            }),
        );

        expect(instance.isResizing).toBe(true);
        expect(container.classList.contains('is-resizing')).toBe(true);
        expect(handleSe.classList.contains('is-active')).toBe(true);
        expect(onResizeStart).toHaveBeenCalledWith(
            container,
            expect.objectContaining({ handle: 'se' }),
        );

        // Pointer move (+50px width, +30px height)
        window.dispatchEvent(
            new PointerEvent('pointermove', {
                clientX: 300,
                clientY: 220,
            }),
        );

        expect(container.style.width).toBe('250px');
        expect(container.style.height).toBe('180px');
        expect(onResize).toHaveBeenCalledWith(
            container,
            expect.objectContaining({
                handle: 'se',
                width: 250,
                height: 180,
            }),
        );

        // Pointer up
        window.dispatchEvent(
            new PointerEvent('pointerup', {
                clientX: 300,
                clientY: 220,
            }),
        );

        expect(instance.isResizing).toBe(false);
        expect(container.classList.contains('is-resizing')).toBe(false);
        expect(handleSe.classList.contains('is-active')).toBe(false);
        expect(onResizeEnd).toHaveBeenCalledWith(
            container,
            expect.objectContaining({
                handle: 'se',
                width: 250,
                height: 180,
            }),
        );

        instance.destroy();
    });

    it('resizes and shifts container position via top-left (nw) corner', () => {
        const instance = resizable(container, {
            positionMode: 'position',
        });

        const handleNw = container.querySelector('.resize-handle-nw') as HTMLElement;

        handleNw.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                clientX: 50,
                clientY: 40,
                button: 0,
            }),
        );

        // Drag -20px left, -15px up (expanding width to 220px, height to 165px)
        window.dispatchEvent(
            new PointerEvent('pointermove', {
                clientX: 30,
                clientY: 25,
            }),
        );

        expect(container.style.width).toBe('220px');
        expect(container.style.height).toBe('165px');
        expect(container.style.left).toBe('30px');
        expect(container.style.top).toBe('25px');

        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 30, clientY: 25 }));
        instance.destroy();
    });

    it('enforces minWidth and minHeight boundaries', () => {
        const instance = resizable(container, {
            minWidth: 100,
            minHeight: 80,
        });

        const handleSe = container.querySelector('.resize-handle-se') as HTMLElement;

        handleSe.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 250,
                clientY: 190,
                button: 0,
            }),
        );

        // Drag far to the left and up to collapse below minimums
        window.dispatchEvent(
            new PointerEvent('pointermove', {
                clientX: 50,
                clientY: 50,
            }),
        );

        expect(container.style.width).toBe('100px');
        expect(container.style.height).toBe('80px');

        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 50, clientY: 50 }));
        instance.destroy();
    });

    it('enforces maxWidth and maxHeight boundaries', () => {
        const instance = resizable(container, {
            maxWidth: 300,
            maxHeight: 250,
        });

        const handleSe = container.querySelector('.resize-handle-se') as HTMLElement;

        handleSe.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 250,
                clientY: 190,
                button: 0,
            }),
        );

        // Drag far to the right and down
        window.dispatchEvent(
            new PointerEvent('pointermove', {
                clientX: 1000,
                clientY: 1000,
            }),
        );

        expect(container.style.width).toBe('300px');
        expect(container.style.height).toBe('250px');

        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 1000, clientY: 1000 }));
        instance.destroy();
    });

    it('respects snap grid constraints', () => {
        const instance = resizable(container, {
            snap: 25,
        });

        const handleSe = container.querySelector('.resize-handle-se') as HTMLElement;

        handleSe.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 250,
                clientY: 190,
                button: 0,
            }),
        );

        // Move by +12px (should round down to +0)
        window.dispatchEvent(
            new PointerEvent('pointermove', {
                clientX: 262,
                clientY: 190,
            }),
        );
        expect(container.style.width).toBe('200px');

        // Move by +18px (should round up to +25)
        window.dispatchEvent(
            new PointerEvent('pointermove', {
                clientX: 268,
                clientY: 190,
            }),
        );
        expect(container.style.width).toBe('225px');

        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 268, clientY: 190 }));
        instance.destroy();
    });

    it('locks aspect ratio when aspectRatio option is enabled', () => {
        // Initial ratio = 200 / 150 = 1.3333333333
        const instance = resizable(container, {
            aspectRatio: 2, // width = 2 * height
        });

        const handleSe = container.querySelector('.resize-handle-se') as HTMLElement;

        handleSe.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 250,
                clientY: 190,
                button: 0,
            }),
        );

        window.dispatchEvent(
            new PointerEvent('pointermove', {
                clientX: 350, // +100px width -> width = 300px
                clientY: 190,
            }),
        );

        expect(container.style.width).toBe('300px');
        expect(container.style.height).toBe('150px');

        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 350, clientY: 190 }));
        instance.destroy();
    });

    it('provides getDimensions and setDimensions programmatic API', () => {
        const instance = resizable(container, {
            minWidth: 50,
            maxWidth: 500,
        });

        instance.setDimensions(350, 220);
        expect(container.style.width).toBe('350px');
        expect(container.style.height).toBe('220px');

        const dims = instance.getDimensions();
        expect(dims.width).toBe(350);
        expect(dims.height).toBe(220);

        instance.destroy();
    });

    it('supports disable and enable methods', () => {
        const instance = resizable(container);
        expect(instance.isEnabled).toBe(true);

        instance.disable();
        expect(instance.isEnabled).toBe(false);
        expect(container.classList.contains('is-disabled')).toBe(true);

        const handleSe = container.querySelector('.resize-handle-se') as HTMLElement;
        handleSe.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 250,
                clientY: 190,
                button: 0,
            }),
        );

        expect(instance.isResizing).toBe(false);

        instance.enable();
        expect(instance.isEnabled).toBe(true);
        expect(container.classList.contains('is-disabled')).toBe(false);

        instance.destroy();
    });

    it('cleans up previous instance when re-invoking on the same container', () => {
        resizable(container);
        expect(container.querySelectorAll('.resize-handle-corner').length).toBe(4);

        const inst2 = resizable(container, { handles: ['se'] });
        // Should not duplicate handles; now only 'se' should exist
        expect(container.querySelectorAll('.resize-handle').length).toBe(1);
        expect(container.querySelector('.resize-handle-se')).not.toBeNull();

        inst2.destroy();
        expect(container.querySelectorAll('.resize-handle').length).toBe(0);
    });

    it('resizableAll initializes multiple containers and handles bulk operations', () => {
        const c1 = document.createElement('div');
        const c2 = document.createElement('div');
        c1.className = 'multi-card';
        c2.className = 'multi-card';
        document.body.appendChild(c1);
        document.body.appendChild(c2);

        const group = resizableAll('.multi-card');
        expect(group.instances.length).toBe(2);
        expect(c1.classList.contains('resizable-container')).toBe(true);
        expect(c2.classList.contains('resizable-container')).toBe(true);

        group.disable();
        expect(c1.classList.contains('is-disabled')).toBe(true);
        expect(c2.classList.contains('is-disabled')).toBe(true);

        group.destroy();
        expect(c1.classList.contains('resizable-container')).toBe(false);
        expect(c2.classList.contains('resizable-container')).toBe(false);

        c1.remove();
        c2.remove();
    });
});

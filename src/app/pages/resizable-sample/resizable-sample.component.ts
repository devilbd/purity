import { Component, signal } from '@purity/core';
import './resizable-sample.component.scss';
import { resizable, type ResizableInstance } from '@behaviors/resizable/resizable';

@Component({
    selector: 'resizable-sample',
    templateUrl: './src/app/pages/resizable-sample/resizable-sample.component.html',
})
export class ResizableSampleComponent {
    private resizer?: ResizableInstance | null;
    private resizerAspect?: ResizableInstance | null;

    public currentWidth = signal<number>(360);
    public currentHeight = signal<number>(200);
    public activeHandle = signal<string>('none');
    public isAspectLocked = signal<boolean>(false);
    public isSnapActive = signal<boolean>(false);
    public lastAction = signal<string>('Ready. Drag any corner handle to resize the container.');

    protected onInit(): void {
        this.initResizers();
    }

    protected onDestroy(): void {
        this.resizer?.destroy();
        this.resizer = null;
        this.resizerAspect?.destroy();
        this.resizerAspect = null;
    }

    public disconnectedCallback(): void {
        this.onDestroy();
    }

    public initResizers(): void {
        this.resizer?.destroy();
        this.resizer = resizable('#resizable-demo-box', {
            minWidth: 200,
            minHeight: 120,
            maxWidth: 680,
            maxHeight: 380,
            aspectRatio: this.isAspectLocked() ? 16 / 9 : false,
            snap: this.isSnapActive() ? 20 : 0,
            onResizeStart: (_, data) => {
                this.activeHandle.set(data.handle);
                this.lastAction.set(`Started resizing via corner handle: ${data.handle.toUpperCase()}`);
            },
            onResize: (_, data) => {
                this.currentWidth.set(Math.round(data.width));
                this.currentHeight.set(Math.round(data.height));
                this.activeHandle.set(data.handle);
            },
            onResizeEnd: (_, data) => {
                this.currentWidth.set(Math.round(data.width));
                this.currentHeight.set(Math.round(data.height));
                this.activeHandle.set('none');
                this.lastAction.set(`Completed resize at ${Math.round(data.width)}×${Math.round(data.height)}px`);
            },
        });

        this.resizerAspect?.destroy();
        this.resizerAspect = resizable('#resizable-mini-card', {
            minWidth: 160,
            minHeight: 100,
            maxWidth: 320,
            maxHeight: 220,
            aspectRatio: true,
        });
    }

    public resetDimensions(): void {
        this.resizer?.setDimensions(360, 200);
        this.currentWidth.set(360);
        this.currentHeight.set(200);
        this.lastAction.set('Reset dimensions to default (360×200px)');
    }

    public setPreset(w: number, h: number): void {
        this.resizer?.setDimensions(w, h);
        this.currentWidth.set(w);
        this.currentHeight.set(h);
        this.lastAction.set(`Applied preset dimensions (${w}×${h}px)`);
    }

    public toggleAspectRatio(): void {
        this.isAspectLocked.set(!this.isAspectLocked());
        this.lastAction.set(`Aspect ratio 16:9 ${this.isAspectLocked() ? 'locked' : 'unlocked'}`);
        this.initResizers();
    }

    public toggleSnap(): void {
        this.isSnapActive.set(!this.isSnapActive());
        this.lastAction.set(`20px grid snapping ${this.isSnapActive() ? 'enabled' : 'disabled'}`);
        this.initResizers();
    }
}

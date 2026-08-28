import { Component, signal, computed } from '@purity/core';
import './virtual-for-sample.component.scss';

export interface DataRecord {
    id: string;
    index: number;
    title: string;
    user: string;
    category: 'Security' | 'Payment' | 'Telemetry' | 'Database' | 'Network';
    status: 'completed' | 'pending' | 'processing' | 'flagged';
    amount: string;
    timestamp: string;
    isFavorite: boolean;
}

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Riley', 'Avery', 'Logan', 'Parker'];
const LAST_NAMES = ['Vance', 'Sterling', 'Chen', 'Novak', 'Sinclair', 'Hayden', 'Kovacs', 'Mercer', 'Bishop', 'Winters'];
const CATEGORIES: DataRecord['category'][] = ['Security', 'Payment', 'Telemetry', 'Database', 'Network'];
const STATUSES: DataRecord['status'][] = ['completed', 'pending', 'processing', 'flagged'];

function generateSampleData(count: number): DataRecord[] {
    const records: DataRecord[] = new Array(count);
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const fn = FIRST_NAMES[i % FIRST_NAMES.length];
        const ln = LAST_NAMES[(i * 7) % LAST_NAMES.length];
        const cat = CATEGORIES[i % CATEGORIES.length];
        const stat = STATUSES[(i * 3) % STATUSES.length];
        const amt = ((i * 37.17) % 5000 + 10).toFixed(2);
        const timeOffset = (count - i) * 60000;
        const date = new Date(now - timeOffset);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        records[i] = {
            id: `TXN-${String(i + 1).padStart(6, '0')}`,
            index: i,
            title: `${cat} Operation #${i + 1}`,
            user: `${fn} ${ln}`,
            category: cat,
            status: stat,
            amount: `$${amt}`,
            timestamp: timeStr,
            isFavorite: i % 17 === 0,
        };
    }
    return records;
}

@Component({
    selector: 'virtual-for-sample',
    templateUrl: './src/app/pages/virtual-for-sample/virtual-for-sample.component.html',
})
export class VirtualForSampleComponent {
    public isLoaded = signal<boolean>(false);
    public datasetSize = signal<number>(100000);
    public items = signal<DataRecord[]>([]);
    public searchQuery = signal<string>('');
    public jumpIndexInput = signal<string>('50000');
    public selectedRecord = signal<DataRecord | null>(null);

    // Live metrics
    public activeDomNodes = signal<number>(0);
    public renderTimeMs = signal<number>(0);
    public visibleRangeText = signal<string>('None');

    private metricsTimer?: number;

    public filteredItems = computed<DataRecord[]>(() => {
        const raw = this.searchQuery();
        const query = (typeof raw === 'string' ? raw : String(raw ?? '')).toLowerCase().trim();
        const all = this.items() || [];
        if (!query) return all;
        return all.filter(
            (item) =>
                item.id.toLowerCase().includes(query) ||
                item.title.toLowerCase().includes(query) ||
                item.user.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query),
        );
    });

    protected onInit(): void {
        // Initially uninitialized on startup until button is pressed
    }

    public initializeSample(count: number = 100000): void {
        this.isLoaded.set(true);
        this.loadDataset(count);
        this.initMetricsTracker();
    }

    public unloadSample(): void {
        this.isLoaded.set(false);
        this.items.set([]);
        this.activeDomNodes.set(0);
        this.visibleRangeText.set('None');
        this.selectedRecord.set(null);
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
            this.metricsTimer = undefined;
        }
    }

    public loadDataset(count: number): void {
        const start = performance.now();
        this.datasetSize.set(count);
        const data = generateSampleData(count);
        this.items.set(data);
        const elapsed = (performance.now() - start).toFixed(1);
        this.renderTimeMs.set(parseFloat(elapsed));
    }

    public onSearchInput(input: HTMLInputElement | any): void {
        const val = input && typeof input.value === 'string'
            ? input.value
            : input && input.target && typeof input.target.value === 'string'
                ? input.target.value
                : typeof input === 'string'
                    ? input
                    : '';
        this.searchQuery.set(val);
    }

    public clearSearch(): void {
        this.searchQuery.set('');
        const input = document.querySelector('#virtual-search-input') as HTMLInputElement | null;
        if (input) input.value = '';
    }

    public jumpTarget = signal<number>(0);

    public onJumpInput(input: HTMLInputElement | any): void {
        const val = input && typeof input.value === 'string'
            ? input.value
            : input && input.target && typeof input.target.value === 'string'
                ? input.target.value
                : typeof input === 'string'
                    ? input
                    : '';
        this.jumpIndexInput.set(val);
    }

    public jumpToSpecifiedIndex(align: 'start' | 'center' | 'end' = 'center'): void {
        const input = document.querySelector('#jump-idx-input') as HTMLInputElement | null;
        const rawVal = input ? input.value : this.jumpIndexInput();
        const target = parseInt(rawVal, 10);
        if (isNaN(target)) return;
        this.scrollToIndex(target, align);
    }

    public jumpToStart(): void {
        this.scrollToIndex(0, 'start');
    }

    public jumpToEnd(): void {
        const max = Math.max(0, this.items().length - 1);
        this.scrollToIndex(max, 'end');
    }

    public jumpToFraction(frac: number): void {
        const total = this.items().length;
        const target = Math.floor(total * frac);
        this.scrollToIndex(target, 'center');
    }

    public scrollToIndex(targetIndex: number, _align: 'start' | 'center' | 'end' = 'start'): void {
        const total = this.items().length;
        if (total === 0) return;
        const target = Math.max(0, Math.min(total - 1, targetIndex));
        this.jumpIndexInput.set(String(target));
        const input = document.querySelector('#jump-idx-input') as HTMLInputElement | null;
        if (input) input.value = String(target);

        this.jumpTarget.set(target);
    }

    public toggleFavorite(index: number, event?: Event): void {
        if (event) event.stopPropagation();
        this.items.update((list) => {
            if (!list[index]) return list;
            const updated = [...list];
            updated[index] = { ...updated[index], isFavorite: !updated[index].isFavorite };
            return updated;
        });
    }

    public selectRecord(record: DataRecord): void {
        this.selectedRecord.set(record);
    }

    public clearSelection(): void {
        this.selectedRecord.set(null);
    }

    private initMetricsTracker(): void {
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
        }
        this.metricsTimer = window.setInterval(() => {
            const container = document.querySelector('virtual-for-sample .p-virtual-scroll-container') as any;
            if (container && typeof container.getVirtualMetrics === 'function') {
                const metrics = container.getVirtualMetrics();
                this.activeDomNodes.set(metrics.renderedCount);
                if (metrics.totalItems > 0) {
                    this.visibleRangeText.set(`#${metrics.startIndex.toLocaleString()} – #${Math.min(metrics.totalItems - 1, metrics.endIndex).toLocaleString()}`);
                } else {
                    this.visibleRangeText.set('None');
                }
            }
        }, 150);
    }

    protected onDestroy(): void {
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
        }
    }
}

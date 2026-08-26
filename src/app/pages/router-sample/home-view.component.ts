import { Component } from '@purity/core';

@Component({
    selector: 'router-home-view',
    template: `
        <div class="route-subview home-subview">
            <div class="subview-header">
                <span class="subview-icon">🏠</span>
                <h4>Dashboard Home View</h4>
            </div>
            <p class="subview-desc">
                Welcome to the Purity signal-driven router! Navigation updates child views instantaneously with zero layout thrashing or browser reloads.
            </p>
            <div class="subview-stats">
                <div class="stat-pill">
                    <span class="stat-label">Active Engine</span>
                    <span class="stat-val">Purity Signal Router</span>
                </div>
                <div class="stat-pill">
                    <span class="stat-label">Reactivity Mode</span>
                    <span class="stat-val">Synchronous Signals</span>
                </div>
            </div>
        </div>
    `,
})
export class RouterHomeViewComponent {}

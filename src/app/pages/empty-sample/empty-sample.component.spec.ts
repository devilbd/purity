import { describe, it, expect } from 'vitest';
import { EmptySampleComponent } from './empty-sample.component';

describe('EmptySampleComponent', () => {
    it('should instantiate component', () => {
        const component = new EmptySampleComponent();
        expect(component).toBeDefined();
    });
});

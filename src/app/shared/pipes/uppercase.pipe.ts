import { Pipe, BasePipe } from '@purity/core';

@Pipe('uppercase')
export class UppercasePipe extends BasePipe {
    transform(value: any): string {
        if (value === null || value === undefined) return '';
        return String(value).toUpperCase();
    }
}

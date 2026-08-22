import { Pipe, BasePipe } from '@purity/core';

@Pipe('myTransformPipe')
export class MyTransformPipe extends BasePipe {
    transform(value: any, isUppercase: boolean = false, prefix?: string): string {
        if (value === null || value === undefined) return '';
        let str = String(value);
        if (isUppercase) {
            str = str.toUpperCase();
        }
        return prefix ? `${prefix}: ${str}` : str;
    }
}

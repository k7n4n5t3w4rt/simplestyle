import { Properties } from 'csstype';
import { SimpleStyleRules } from './types';
export interface CreateStylesOptions {
    accumulate: boolean;
    flush: boolean;
}
export declare function rawStyles<T extends SimpleStyleRules, K extends keyof T, O extends {
    [key in K]: string;
}>(rules: T, options?: Partial<CreateStylesOptions> | null, uid?: string | null): string;
export declare function keyframes<T extends {
    [increment: string]: Properties;
}>(frames: T, options?: CreateStylesOptions | null, uid?: string | null): [string, string];
export default function createStyles<T extends SimpleStyleRules, K extends keyof T, O extends {
    [classKey in K]: string;
}>(rules: T, options?: Partial<CreateStylesOptions> | null, uid?: string | null): [O, string];
export declare type CreateStylesArgs = Parameters<typeof createStyles>;

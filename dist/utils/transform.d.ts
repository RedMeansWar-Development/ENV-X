import { TransformFn } from "../types/env-x.types";
export declare class TransformManager {
    private transforms;
    add(key: string, fn: TransformFn): void;
    apply(key: string, value: any): any;
}

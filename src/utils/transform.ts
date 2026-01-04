import { TransformFn } from "../types/env-x.types";

export class TransformManager {
    private transforms: Map<string, TransformFn> = new Map();
    
    add(key: string, fn: TransformFn) {
        this.transforms.set(key, fn);
    }

    apply(key: string, value: any) {
        if (this.transforms.has(key))
            return this.transforms.get(key)!(value);

        return value;
    }
}
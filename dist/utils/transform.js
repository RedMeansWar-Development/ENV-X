"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformManager = void 0;
class TransformManager {
    constructor() {
        this.transforms = new Map();
    }
    add(key, fn) {
        this.transforms.set(key, fn);
    }
    apply(key, value) {
        if (this.transforms.has(key))
            return this.transforms.get(key)(value);
        return value;
    }
}
exports.TransformManager = TransformManager;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseValue = parseValue;
function parseValue(raw, type) {
    const value = raw.trim();
    if (value === '') {
        throw new Error('[ENV-X] Empty value is not allowed');
    }
    switch (type) {
        case 'number': {
            const num = Number(value);
            if (Number.isNaN(num)) {
                throw new Error(`[ENV-X] Invalid number: "${raw}"`);
            }
            return num;
        }
        case 'boolean': {
            if (value !== 'true' && value !== 'false') {
                throw new Error(`[ENV-X] Invalid boolean: "${raw}" (expected true|false)`);
            }
            return (value === 'true');
        }
        case 'object': {
            try {
                return JSON.parse(value);
            }
            catch {
                throw new Error(`[ENV-X] Invalid JSON object: "${raw}"`);
            }
        }
        case 'array': {
            try {
                if (value.startsWith('[')) {
                    return JSON.parse(value);
                }
                return value.split(',').map(v => v.trim());
            }
            catch {
                throw new Error(`[ENV-X] Invalid array: "${raw}"`);
            }
        }
        case 'map': {
            const map = new Map();
            const pairs = value.split(',');
            for (const pair of pairs) {
                const [k, v] = pair.split(':');
                if (!k || v === undefined) {
                    throw new Error(`[ENV-X] Invalid map entry: "${pair}"`);
                }
                map.set(k.trim(), v.trim());
            }
            return map;
        }
        case 'string':
        default:
            return value;
    }
}

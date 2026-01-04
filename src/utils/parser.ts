export function parseValue<T>(raw: string, type: string | undefined): T {
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
            return num as unknown as T;
        }

        case 'boolean': {
            if (value !== 'true' && value !== 'false') {
                throw new Error(`[ENV-X] Invalid boolean: "${raw}" (expected true|false)`);
            }
            return (value === 'true') as unknown as T;
        }

        case 'object': {
            try {
                return JSON.parse(value) as T;
            } catch {
                throw new Error(`[ENV-X] Invalid JSON object: "${raw}"`);
            }
        }

        case 'array': {
            try {
                if (value.startsWith('[')) {
                    return JSON.parse(value) as T;
                }
                return value.split(',').map(v => v.trim()) as unknown as T;
            } catch {
                throw new Error(`[ENV-X] Invalid array: "${raw}"`);
            }
        }

        case 'map': {
            const map = new Map<string, string>();
            const pairs = value.split(',');

            for (const pair of pairs) {
                const [k, v] = pair.split(':');
                if (!k || v === undefined) {
                    throw new Error(`[ENV-X] Invalid map entry: "${pair}"`);
                }
                map.set(k.trim(), v.trim());
            }

            return map as unknown as T;
        }

        case 'string':
        default:
            return value as unknown as T;
    }
}
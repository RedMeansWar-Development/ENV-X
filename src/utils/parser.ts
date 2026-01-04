export function parseValue<T>(raw: string, type: string): T {
    switch (type) {
        case 'number': return Number(raw) as unknown as T;
        case 'boolean': return (raw === 'true') as unknown as T;
        case 'object': return JSON.parse(raw) as T;
        case 'array':
            if (raw.trim().startsWith('[')) 
                return JSON.parse(raw) as T;
            
            return raw.split(',').map((v) => v.trim()) as unknown as T;
        case 'map':
            const map = new Map<string, string>();
            
            raw.split(',').forEach((pair) => {
                const [k, v] = pair.split(':').map((p) => p.trim());
                if (k) map.set(k, v ?? '');
            });

            return map as unknown as T;
        case 'string':
        default: return raw as unknown as T;
    }
}
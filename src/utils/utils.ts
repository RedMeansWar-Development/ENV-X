export function maskValue(value: string, maskKeys: string[], key: string): string {
    if (maskKeys.some((k) => key.toUpperCase().includes(k.toUpperCase()))) return "";
    return value;
}

export function debugLog(message: string, debug?: boolean) {
    if (debug)
        console.log(`[ENV-X] ${message}`);
}
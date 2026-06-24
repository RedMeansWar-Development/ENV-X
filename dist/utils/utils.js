"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskValue = maskValue;
exports.debugLog = debugLog;
function maskValue(value, maskKeys, key) {
    if (maskKeys.some((k) => key.toUpperCase().includes(k.toUpperCase())))
        return "";
    return value;
}
function debugLog(message, debug) {
    if (debug)
        console.log(`[ENV-X] ${message}`);
}

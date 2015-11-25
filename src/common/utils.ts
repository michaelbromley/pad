/**
 * Clone an object - only suitable for simple values (no functions or circular refs).
 */
export function clone(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
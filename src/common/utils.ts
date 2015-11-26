/**
 * Clone an object - only suitable for simple values (no functions or circular refs).
 */
export function clone(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Given a JavaScript timestamp (in milliseconds) return a human-readable
 * string of how long ago that was.
 * Based on http://stackoverflow.com/a/3177838/772859
 */
export function timeAgo(timestamp: number): string {

    let seconds = (Date.now() - timestamp) / 1000;
    let interval = Math.floor(seconds / 31536000);
    let intervalType;

    if (seconds < 60) {
        return 'just now';
    }

    if (interval >= 1) {
        intervalType = 'year';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'month';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'day';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "hour";
                } else {
                    interval = Math.floor(seconds / 60);
                        intervalType = "minute";
                }
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType + ' ago';
}
export function generateDeviceFingerprint(ipAddress, userAgent) {
    if (!ipAddress && !userAgent)
        return undefined;
    const raw = `${ipAddress ?? "unknown"}|${userAgent ?? "unknown"}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `dev_${Math.abs(hash).toString(36)}`;
}
export const DEFAULT_SESSION_CONSTRAINTS = {
    maxActiveSessions: 5,
};

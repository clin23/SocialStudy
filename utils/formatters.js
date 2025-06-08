export const formatDuration = (seconds) => {
    if (seconds === null || typeof seconds === 'undefined' || isNaN(seconds)) seconds = 0;
    if (seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
};

export const formatDurationInMinutes = (seconds) => {
    if (seconds === null || typeof seconds === 'undefined' || isNaN(seconds)) seconds = 0;
    if (seconds < 0) seconds = 0;
    return Math.floor(seconds / 60);
};

export const timeAgo = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Just now';
    const now = new Date();
    const seconds = Math.round((now - timestamp.toDate()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
};
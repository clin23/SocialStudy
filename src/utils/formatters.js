export const formatDuration = (seconds) => {
  if (seconds === null || typeof seconds === "undefined" || isNaN(seconds))
    seconds = 0;
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${s}s`;
};

export const formatDurationInMinutes = (seconds) => {
  if (seconds === null || typeof seconds === "undefined" || isNaN(seconds))
    seconds = 0;
  if (seconds < 0) seconds = 0;
  return Math.floor(seconds / 60);
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return "Just now";

  const now = new Date();
  const date = timestamp.toDate();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

export const timeAgo = formatTimestamp;

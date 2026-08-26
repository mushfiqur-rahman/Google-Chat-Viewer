/**
 * Utility functions for date parsing and formatting Google Chat Takeout timestamps.
 */

export function parseTakeoutDate(dateStr: any): { timestamp: number; formatted: string } {
  if (!dateStr) {
    return { timestamp: Date.now(), formatted: 'Unknown date' };
  }

  // If it's already a number or string number (e.g. Hangouts timestamp in microseconds or millis)
  if (typeof dateStr === 'number' || (!isNaN(Number(dateStr)) && !isNaN(parseFloat(dateStr)))) {
    let num = Number(dateStr);
    // Hangouts uses microseconds (16 digits)
    if (num > 1e14) {
      num = Math.floor(num / 1000);
    }
    const d = new Date(num);
    if (!isNaN(d.getTime())) {
      return { timestamp: d.getTime(), formatted: formatFullDateTime(d) };
    }
  }

  if (typeof dateStr === 'string') {
    // Try native Date parse (handles ISO strings like 2023-01-15T14:30:00.000Z)
    let parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      return { timestamp: d.getTime(), formatted: formatFullDateTime(d) };
    }

    // Handle Google Takeout format: "Wednesday, October 12, 2022 at 3:45:12 PM UTC"
    // Clean " at " -> " "
    const cleaned = dateStr.replace(' at ', ' ').replace(' UTC', ' GMT+0000');
    parsed = Date.parse(cleaned);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      return { timestamp: d.getTime(), formatted: formatFullDateTime(d) };
    }

    // Try regex for "Day, Month DD, YYYY [at] HH:MM:SS AM/PM [TZ]"
    const match = dateStr.match(/(\w+),\s+([A-Za-z]+)\s+(\d+),\s+(\d{4})(?:\s+at\s+|\s+)(\d+):(\d+):?(\d+)?\s*(AM|PM)?/i);
    if (match) {
      const [, , monthStr, day, year, hours, minutes, seconds = '0', ampm] = match;
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const monthIdx = months.findIndex(m => monthStr.toLowerCase().startsWith(m.slice(0, 3)));
      if (monthIdx !== -1) {
        let h = parseInt(hours, 10);
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
          if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
        }
        const d = new Date(Date.UTC(parseInt(year, 10), monthIdx, parseInt(day, 10), h, parseInt(minutes, 10), parseInt(seconds, 10)));
        if (!isNaN(d.getTime())) {
          return { timestamp: d.getTime(), formatted: formatFullDateTime(d) };
        }
      }
    }
  }

  return { timestamp: Date.now(), formatted: String(dateStr) };
}

export function formatTimeOnly(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDateDivider(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    month: 'long',
    day: 'numeric',
  });
}

export function formatFullDateTime(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

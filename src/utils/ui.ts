/**
 * UI and Formatting helpers matching Google High-Density aesthetic
 */

const GOOGLE_AVATAR_COLORS = [
  { bg: 'bg-[#1a73e8]', text: 'text-white', lightBg: 'bg-[#e8f0fe] dark:bg-[#1a73e8]/20', lightText: 'text-[#1967d2] dark:text-[#8ab4f8]' },
  { bg: 'bg-[#ea4335]', text: 'text-white', lightBg: 'bg-[#fce8e6] dark:bg-[#ea4335]/20', lightText: 'text-[#c5221f] dark:text-[#f28b82]' },
  { bg: 'bg-[#fbbc04]', text: 'text-neutral-900', lightBg: 'bg-[#fef7e0] dark:bg-[#fbbc04]/20', lightText: 'text-[#b06000] dark:text-[#fdd663]' },
  { bg: 'bg-[#34a853]', text: 'text-white', lightBg: 'bg-[#e6f4ea] dark:bg-[#34a853]/20', lightText: 'text-[#137333] dark:text-[#81c995]' },
  { bg: 'bg-[#9334e6]', text: 'text-white', lightBg: 'bg-[#f3e8fd] dark:bg-[#9334e6]/20', lightText: 'text-[#8430ce] dark:text-[#c58af9]' },
  { bg: 'bg-[#129eaf]', text: 'text-white', lightBg: 'bg-[#e4f7fb] dark:bg-[#129eaf]/20', lightText: 'text-[#007b83] dark:text-[#78d9ec]' },
  { bg: 'bg-[#e8710a]', text: 'text-white', lightBg: 'bg-[#feefe3] dark:bg-[#e8710a]/20', lightText: 'text-[#b05200] dark:text-[#fcad70]' },
  { bg: 'bg-[#5f6368]', text: 'text-white', lightBg: 'bg-[#f1f3f4] dark:bg-[#5f6368]/20', lightText: 'text-[#3c4043] dark:text-[#dadce0]' },
];

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GOOGLE_AVATAR_COLORS.length;
  return GOOGLE_AVATAR_COLORS[index];
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Format bytes to readable string (e.g. 2.4 MB)
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}


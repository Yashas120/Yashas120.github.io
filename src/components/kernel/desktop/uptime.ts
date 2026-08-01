/** Career start — the machine's notional boot time, shared by the tray and neofetch. */
export const EPOCH = new Date("2019-08-01T00:00:00Z").getTime();

export const BOOT_LABEL = "Aug 2019";

export function formatUptime(now: number): string {
  const days = Math.floor((now - EPOCH) / 86_400_000);
  return `${Math.floor(days / 365)}y ${days % 365}d`;
}
